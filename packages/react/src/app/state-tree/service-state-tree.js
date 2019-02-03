import StateTree, { state, action, memoize } from '@benzed/state-tree'

import ClientStateTree, { $$feathers } from './client-state-tree'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { wrap, unwrap } from '@benzed/array'
import { PromiseQueue } from '@benzed/async'
import { equals, $$equals, indexOf } from '@benzed/immutable'

import { FormStateTree } from '../../data-form'

import is from 'is-explicit'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const $$queue = Symbol('query-queue')
const $$prunable = Symbol('data-is-prunable')
const $$records = Symbol('records-as-hash-by-id')

const PARALLEL_QUERIES = 10

const STATUSES = {
  Scoped: 'scoped',
  Unfetched: 'unfetched',
  Unscoped: 'unscoped'
}

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperty } = Object

const idsMissing = (records, ids) => {
  for (const id of ids)
    if (id in records === false)
      return true

  return false
}

const ensureRecords = (records, ids) => {

  records = { ...records }

  let ensured = null

  for (const id of ids)
    if (id in records === false) {
      ensured = ensured || []
      records[id] = { _status: STATUSES.Unfetched, _id: id }
    }

  return records

}

/******************************************************************************/
// Query Queue
/******************************************************************************/

class QueryQueueItem extends PromiseQueue.Item {

  constructor (promiser, data) {
    super(promiser)
    this.data = data
  }

  [$$equals] (data) {

    data = data instanceof QueryQueueItem
      ? data.data
      : data

    return equals(this.data.method, data.method) &&
      equals(this.data.arg, data.arg)
  }

}

class QueryQueue extends PromiseQueue {

  static Item = QueryQueueItem

  tree = null

  constructor (tree) {
    super(PARALLEL_QUERIES)
    this.tree = tree
  }

  onNext () {
    this.tree.setFetching(this.count > 0)
  }

  onDone = this.onNext

}

function executePatchWithData () {

  const item = this
  const { id, differences, tree } = item.data

  const { client, serviceName: service } = tree.config

  return client[$$feathers]
    .service(service)
    .patch(id, differences)

}

async function executeQueryWithData () {

  const item = this
  const { method, arg, tree } = item.data
  const { client, serviceName: service } = tree.config

  const explicitIds = getIdsFromQuery(arg.query)
  if (explicitIds && idsMissing(tree.records, explicitIds)) {

    const records = tree.state[$$records]

    const ensured = ensureRecords(records, explicitIds)
    tree.setRecords(ensured)
  }

  let results
  try {
    results = await client[$$feathers].service(service)[method](arg)
  } catch (err) {
    throw err
  }

  // if pagination isn't enabled on this service, we cast the result
  // to look as if it was
  if (is.array(results))
    results = {
      total: results.length,
      limit: arg.query?.$limit || results.length,
      skip: arg.query?.$skip || 0,
      data: results
    }

  // create a
  const ids = []
  const changes = []
  for (const doc of results.data) {
    const { _id, ...data } = doc
    ids.push(_id)
    changes.push(data)
  }

  const records = ensureRecords(tree.state[$$records], ids)

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    const data = changes[i]

    records[id] = {
      ...records[id],
      ...data,
      _status: STATUSES.Scoped
    }
  }

  if (explicitIds) for (const explicitId of explicitIds)
    if (!ids.includes(explicitId))
      records[explicitId]._status = STATUSES.Unscoped

  tree.setRecords(records)
  tree.updateTimestamp()

  return results
}

function ensureFetching (query) {

  const tree = this

  const data = {
    method: 'find',
    arg: { query },
    tree
  }

  const queue = tree[$$queue]
  const { items } = queue
  const index = items::indexOf(data)

  return index > -1
    ? items[index].complete
    : queue.add(executeQueryWithData, data)
}

function requiresFetch (id) {

  const tree = this
  const record = tree.state[$$records][id]

  return !record || record._status === STATUSES.Unfetched
}

const getIdsFromQuery = query => {
  let ids = query._id
  if (is.plainObject(ids))
    ids = ids.$in

  return is.defined(ids)
    ? wrap(ids)
    : null
}

const getDataDifferences = (edit, original) => {

  const editIsObj = is.plainObject(edit)
  const origIsObj = is.plainObject(edit)

  let differences
  if (editIsObj && origIsObj) {
    differences = {}
    for (const key in edit) {
      const result = getDataDifferences(edit[key], original[key])
      if (result !== $$prunable)
        differences[key] = result
    }
  } else
    differences = equals(edit, original)
      ? $$prunable
      : edit

  return differences
}

/******************************************************************************/
// Validation
/******************************************************************************/

const validateConfig = <object key='config' plain strict >
  <ClientStateTree key='client' required />
  <string key='serviceName' required />
</object>

/******************************************************************************/
// Setup
/******************************************************************************/

function handleEvents ({ client, serviceName }) {

  // Will catch self-induced events in rest
  // if (client?.config?.provider !== 'socketio')
  //   return

  const tree = this
  const service = client[$$feathers].service(serviceName)

  const onCreate = data => {
    const records = { ...tree.state[$$records] }

    records[data._id] = {
      ...data,
      _form: null,
      _status: STATUSES.Scoped
    }

    tree.setRecords(records)
    tree.updateTimestamp()
  }

  const onEdit = data => {

    const record = tree.state[$$records][data._id]
    if (!record)
      return

    tree.setState({
      ...record,
      ...data,
      _status: STATUSES.Scoped
    }, [ $$records, `${data._id}` ])

    tree.updateTimestamp()
  }

  const onDelete = data => {
    if (data._id in this.state[$$records] === false)
      return

    const records = { ...this.state[$$records] }
    delete records[data._id]

    tree.setRecords(records)
    tree.updateTimestamp()
  }

  service
    .on('created', onCreate)
    .on('patched', onEdit)
    .on('updated', onEdit)
    .on('removed', onDelete)
}

/******************************************************************************/
// Main
/******************************************************************************/

class ServiceStateTree extends StateTree {

  config = null

  @state.symbol($$records)
  $$records = {}

  @state
  timestamp = null

  @state
  fetching = false

  @action('timestamp')
  updateTimestamp = () => new Date()

  @action('fetching')
  setFetching = value => !!value

  @action($$records)
  setRecords = records => {

    if (is.array(records)) {
      const hash = {}
      for (const record of records)
        hash[record.id || record._id] = record
      records = hash
    }

    return records
  }

  @memoize($$records)
  get records () {
    return Object
      .values(this.state[$$records])
  }

  @memoize($$records)
  get forms () {
    return Object
      .values(this.state[$$records])
      .map(record => record._form)
      .filter(is.defined)
  }

  /* Form Interface */

  getForm = id => {

    const record = this.get(id)

    let form = record._form

    // Create Form
    if (!is(form, FormStateTree)) {

      const ui = this.root?.ui

      form = new FormStateTree({
        data: record,
        submit: data => this.patch(id, data),
        ui,
        historyStorageKey: ui && `form-${this.config.serviceName}-${id}`
      })

      const callback = service => {

        const record = service.get(id)

        const data = { ...record }
        delete data._form

        const shouldAutoRevert = !form.hasChangesToCurrent

        form.setUpstream(data)
        if (shouldAutoRevert)
          form.revertToUpstream()
      }

      this.subscribe(callback, [ $$records, `${id}` ])

      this.setState(form, [ $$records, `${id}`, '_form' ], 'setRecordForm')
    }

    return form
  }

  /* Feathers Interface */

  find = (query = {}) => this::ensureFetching(query)

  get = id => {

    const ids = wrap(id)
    if (!ids.every(is.defined))
      throw new Error('ids cannot be null or undefined')

    const fetchIds = ids
      .filter(this::requiresFetch)

    if (fetchIds.length > 0) {
      const _id = fetchIds.length > 1
        ? { $in: fetchIds }
        : unwrap(fetchIds)

      this::ensureFetching({ _id })
    }

    if (fetchIds.length > 0) {
      const records = this.state[$$records]
      const ensured = ensureRecords(records, fetchIds)
      this.setRecords(ensured)
    }

    return is.array(id)
      ? ids.map(id => this.state[$$records][id])
      : this.state[$$records][id]

  }

  patch = (id, data) => {

    if (!is.defined(id))
      throw new Error(`id is required`)

    const differences = getDataDifferences(data, this.get(id))

    const item = { id, tree: this, differences }

    return this[$$queue].add(executePatchWithData, item)
  }

  /* Convenience */

  untilFetchingComplete () {
    const completes = this[$$queue]
      .items
      .map(item => item.complete)

    return Promise.all(completes)
  }

  constructor (config) {
    super({ timestamp: new Date() })

    defineProperty(this, 'config', {
      value: validateConfig(config),
      enumerable: true,
      writable: false
    })

    defineProperty(this, $$queue, {
      value: new QueryQueue(this),
      enumerable: true
    })

    this::handleEvents(this.config)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ServiceStateTree

export {
  $$queue
}
