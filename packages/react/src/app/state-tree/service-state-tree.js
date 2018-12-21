import StateTree, { $$state } from '../../state-tree/state-tree'
import { $$feathers } from './client-state-tree'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { wrap, unwrap } from '@benzed/array'
import { PromiseQueue } from '@benzed/async'
import { copy, equals, $$equals, indexOf } from '@benzed/immutable'

import is from 'is-explicit'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const $$queue = Symbol('query-queue')
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

const getRecordsCount = records => {

  let count = 0
  let _ // eslint-disable-line no-unused-vars
  for (_ in records)
    count += 1

  if ('count' in records)
    count--

  return count
}

const idsMissing = (records, ids) => {
  for (const id of ids)
    if (id in records === false)
      return true

  return false
}

const ensureRecords = (records, ids) => {

  let ensured = null

  for (const id of ids)
    if (id in records === false) {
      ensured = ensured || []
      records[id] = { status: STATUSES.Unfetched, _id: id }
    }

  records.count = getRecordsCount(records)

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

  constructor () {
    super(PARALLEL_QUERIES)
  }

}

async function executeQueryWithData () {

  const item = this
  const { data } = item

  const { method, arg, tree } = data

  const { client, serviceName: service } = tree.config

  const explicitIds = getIdsFromQuery(arg.query)
  if (explicitIds && idsMissing(tree.records, explicitIds)) {

    const [ records, setRecords ] = tree('records')

    const ensured = ensureRecords(records::copy(), explicitIds)
    setRecords(ensured)

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

  const [ records, setRecords ] = tree('records')

  setRecords(records::copy(records => {

    ensureRecords(records, ids)

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      const data = changes[i]

      records[id] = {
        ...records[id],
        ...data,
        status: STATUSES.Scoped
      }
    }

    if (explicitIds) for (const explicitId of explicitIds)
      if (!ids.includes(explicitId))
        records[explicitId].status = STATUSES.Unscoped

  }))

  tree('timestamp').set(new Date())

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
  const record = tree.records[id]

  return !record || record.status === STATUSES.Unfetched
}

const getIdsFromQuery = query => {
  let ids = query._id
  if (is.plainObject(ids))
    ids = ids.$in

  return is.defined(ids)
    ? wrap(ids)
    : null
}

/******************************************************************************/
// Validation
/******************************************************************************/

const isClientStateTree = value =>
  !is.defined(value)
    ? value
    : $$feathers in value && $$state in value && is.func(value.connect)
      ? value
      : throw new Error('must be a ClientStateTree.')

const validateConfig = <object key='config' plain strict >
  <func key='client' required validate={isClientStateTree} />
  <string key='serviceName' required />
</object>

const validateActions = <object plain key='actions' default={{}} />
const validateState = <object plain key='state' default={{}} />

/******************************************************************************/
// Setup
/******************************************************************************/

const STATE = {

  records: { count: 0 },
  drafts: { count: 0 },
  errors: { count: 0 },

  timestamp: new Date()
}

const ACTIONS = {

  get (id) {
    const tree = this
    const ids = wrap(id)
    if (!ids.every(is.defined))
      throw new Error('ids cannot be null or undefined')

    const fetchIds = ids
      .filter(tree::requiresFetch)

    if (fetchIds.length > 0) {
      const _id = fetchIds.length > 1
        ? { $in: fetchIds }
        : unwrap(fetchIds)

      tree::ensureFetching({ _id })
    }

    if (fetchIds.length > 0) {
      const [ records, setRecords ] = tree('records')
      const ensured = ensureRecords(copy(records), fetchIds)
      setRecords(ensured)
    }

    return is.array(id)
      ? ids.map(id => tree.records[id])
      : tree.records[id]

  },

  find (query = {}) {
    const tree = this
    return tree::ensureFetching(query)
  },

  untilFetchingComplete () {
    const completes = this[$$queue]
      .items
      .map(item => item.complete)

    return Promise.all(completes)
  }

}

function handleEvents ({ client, serviceName }) {

  if (client?.config?.provider !== 'socketio')
    return

  const tree = this
  const service = client[$$feathers].service(serviceName)

  const { set: setRecords } = tree('records')
  const { set: setTimestamp } = tree('timestamp')

  const onCreate = data => {
    const records = copy(tree.records)

    records[data._id] = {
      ...data,
      status: STATUSES.Scoped
    }

    records.count = getRecordsCount(records)

    setRecords(records)
    setTimestamp(new Date())
  }

  const onEdit = data => {
    const [ record, setRecord ] = tree([ 'records', data._id ])
    if (record) {
      setRecord({ ...data, status: STATUSES.Scoped })
      setTimestamp(new Date())
    }
  }

  const onDelete = data => {
    if (data._id in this.records === false)
      return

    const records = copy(this.records)
    delete records[data._id]

    setRecords(records)
    setTimestamp(new Date())
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

function ServiceStateTree (config, state, actions) {

  if (!actions && is.objectOf.func(state)) {
    actions = state
    state = null
  }

  config = validateConfig(config)
  state = validateState(state)
  actions = validateActions(actions)

  const tree = new StateTree(
    { ...STATE, ...state },
    { ...ACTIONS, ...actions }
  )

  tree::handleEvents(config)

  defineProperty(tree, 'config', { value: config, enumerable: true })
  defineProperty(tree, $$queue, { value: new QueryQueue(), enumerable: true })
  defineProperty(tree, 'all', {
    get () {
      const { count, ...records } = this.records
      return Object.values(records)
    },
    enumerable: true
  })

  return tree
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ServiceStateTree

export {
  $$queue
}
