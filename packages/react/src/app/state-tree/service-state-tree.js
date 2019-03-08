import StateTree, { state, action, memoize } from '@benzed/state-tree'

import ClientStateTree, { $$feathers } from './client-state-tree'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { wrap, unwrap } from '@benzed/array'
import { PromiseQueue } from '@benzed/async'
import { equals, $$equals, indexOf } from '@benzed/immutable'

import { FormStateTree } from '../../form'
import is from 'is-explicit'
import ObjectID from 'bson-objectid'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const $$prunable = Symbol('data-is-prunable')
const $$records = Symbol('records-as-hash-by-id')
const $$forms = Symbol('forms-by-record-id')
const $$queue = Symbol('query-queue')

const PARALLEL_QUERIES = 10

const STATUSES = {

  // Data exists client side only, has not yet been sent to server for creation.
  PreCreated: 'pre-created',

  // Record is only known by id. Server has not yet been queried for data.
  // Existance or permissions unknown.
  PreScoped: 'pre-scoped',

  // Data has been fetched from the server. It exists and we have permission
  // To See It
  Scoped: 'scoped',

  // Fetching from server failed, data could not be found.
  Missing: 'missing',

  // Fetching form server fail, we do not have permissions to see data
  Forbidden: 'forbidden'

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
      records[id] = { _status: STATUSES.PreScoped, _id: id }
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

async function executeChangeWithData () {

  const item = this
  const { args, tree, method } = item.data

  const { client, serviceName } = tree.config

  const service = client[$$feathers].service(serviceName)
  const record = await service[method](...args)

  return filterDataBlacklist(record, tree.config.formDataBlacklist)
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
    console.log(err)
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

  // filter forbidden data
  results.data = results.data.map(doc => doc || {
    _status: STATUSES.Forbidden
  })

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

    const original = records[id]

    const updated = records[id] = {
      ...original,
      ...data,
      _status: data._status || STATUSES.Scoped
    }

    const form = tree.state[$$forms][id]
    if (!form)
      continue

    // Apply Changes to Form
    const hasChanges = form.hasChangesToCurrent
    const upstream = filterDataBlacklist(updated, tree.config.formDataBlacklist)
    form.setUpstream(upstream)

    // Reset form if it was missing and hasn't been touched
    if (original._status !== STATUSES.Scoped &&
      updated._status === STATUSES.Scoped &&
      !hasChanges)
      form.revertToUpstream()

  }

  if (explicitIds) for (const explicitId of explicitIds)
    if (!ids.includes(explicitId))
      records[explicitId]._status = STATUSES.Missing

  tree.setRecords(records)
  tree.updateTimestamp()

  return results
}

function ensureFetching (query = {}) {

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

  return !record || record._status === STATUSES.PreScoped
}

const getIdsFromQuery = query => {
  let ids = query._id
  if (is.plainObject(ids))
    ids = ids.$in

  return is.defined(ids)
    ? wrap(ids)
    : null
}

const filterDataBlacklist = (data, blacklist) => {

  data = { ...data }

  for (const key in data)
    if (blacklist.includes(key))
      delete data[key]

  return data
}

const filterDataDifferences = (edit, original) => {

  const editIsObj = is.plainObject(edit)
  const origIsObj = is.plainObject(edit)

  let differences
  if (editIsObj && origIsObj) {

    differences = {}

    for (const key in edit) {
      const result = filterDataDifferences(edit[key], original[key])
      if (result !== $$prunable)
        differences[key] = result
    }

    if (Object.keys(differences).length === 0)
      differences = $$prunable

  } else
    differences = equals(edit, original)
      ? $$prunable
      : edit

  return differences
}

const excludeRecordAndForm = (tree, _id, onlyClearRecordIfPreCreated) => {
  const records = { ...tree.state[$$records] }

  const doDelete = !onlyClearRecordIfPreCreated ||
    (_id in records && records[_id].status === STATUSES.PreCreated)

  if (doDelete)
    delete records[_id]

  let forms = tree.state[$$forms]
  if (_id in forms) {
    forms = { ...forms }
    delete forms[_id]
  }

  tree.setState({
    ...tree.state,
    [$$forms]: forms,
    [$$records]: records
  }, [], 'deleteRecordAndAssociatedForm')
}

/******************************************************************************/
// Validation
/******************************************************************************/

const validateConfig = <object key='config' plain strict >
  <ClientStateTree key='client' required />
  <string key='serviceName' required />
  <array key='formDataBlacklist' default={[ '_id', '_status' ]} >
    <string required />
  </array>
</object>

/******************************************************************************/
// Setup
/******************************************************************************/

function handleEvents ({ client, serviceName }) {

  const tree = this
  const service = client[$$feathers].service(serviceName)

  const onCreate = data => {
    const records = { ...tree.state[$$records] }

    records[data._id] = {
      ...data,
      _status: STATUSES.Scoped
    }

    tree.setRecords(records)
    tree.updateTimestamp()
  }

  const onEdit = data => {

    const record = tree.state[$$records][data._id]
    if (!record)
      return

    const newData = {
      ...record,
      ...data,
      _status: STATUSES.Scoped
    }

    tree.setState(newData, [ $$records, `${data._id}` ])
    const form = tree.state[$$forms][data._id]
    if (form)
      form.setUpstream(newData)

    tree.updateTimestamp()
  }

  const onDelete = data => {

    if (data._id in this.state[$$records] === false)
      return

    excludeRecordAndForm(tree, data._id)

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

  @state.symbol($$forms)
  $$forms = {}

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
  get preCreatedRecords () {
    const created = Object
      .values(this.state[$$records])
      .filter(r => r._status === STATUSES.PreCreated)

    console.log(...created)

    return created
  }

  @memoize($$forms)
  get forms () {
    return Object
      .values(this.state[$$forms])
      .filter(is.defined)
  }

  /* Form Interface */
  useForm = id => {

    let form = this.state[$$forms][id]

    // Create Form
    if (!is(form, FormStateTree)) {

      const ui = this.root?.ui

      const data = filterDataBlacklist(
        this.get(id),
        this.config.formDataBlacklist
      )

      form = new FormStateTree({
        ui,
        data,
        id,
        submit: data =>
          this.get(id)._status === 'pre-created'
            ? this.create({ ...data, _id: id })
            : this.patch(id, data),
        historyStorageKey: ui && `form-${this.config.serviceName}-${id}`
      })

      this.setState(form, [ $$forms, `${id}` ], 'createRecordForm')
    }

    return form
  }

  getForm = id => this.state[$$forms][id]

  createForm = () => {

    const id = new ObjectID().toString()

    const record = {
      _id: id,
      _status: 'pre-created'
    }

    this.setState(record, [ $$records, id ], 'preCreateRecord')

    return this.useForm(id)
  }

  clearForm = id => {
    excludeRecordAndForm(this, id, true)
  }

  /* Feathers Interface */
  find = this::ensureFetching

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

  create = async data => {

    // seperate id just in case blacklist removes it
    const _id = data._id

    data = filterDataBlacklist(data, this.config.formDataBlacklist)

    // ensure _id is added back in
    const item = { tree: this, args: [{ ...data, _id }], method: 'create' }
    const created = await this[$$queue].add(executeChangeWithData, item)

    console.log('CREATE',
      this.config.serviceName,
      created
    )

    return filterDataBlacklist(created, this.config.formDataBlacklist)

  }

  patch = async (id, data) => {

    if (!is.defined(id))
      throw new Error(`id is required`)

    data = filterDataDifferences(data, this.get(id))
    // No differences
    if (data === $$prunable)
      return null

    const item = { tree: this, args: [id, data], method: 'patch' }

    const patched = await this[$$queue].add(executeChangeWithData, item)

    console.log('PATCHED',
      this.config.serviceName,
      id,
      patched
    )

    return filterDataBlacklist(patched, this.config.formDataBlacklist)
  }

  remove = async id => {

    if (!is.defined(id))
      throw new Error(`id is required`)

    const item = { tree: this, args: [ id ], method: 'remove' }

    const removed = await this[$$queue].add(executeChangeWithData, item)

    console.log('REMOVED',
      this.config.serviceName,
      id,
      removed
    )

    excludeRecordAndForm(this, id)

    return filterDataBlacklist(removed, this.config.formDataBlacklist)
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
  $$queue,
  $$records,
  $$feathers
}
