import ServiceRecord from './service-record'
import Store from '../../store/store'
import ClientStore from './client-store'
import is from 'is-explicit'

import { equals, merge, EQUALS, indexOf } from '@benzed/immutable'
import { wrap, unwrap } from '@benzed/array'
import { PromiseQueue } from '@benzed/async'
import {
  Schema, required, string, any, typeOf, number, defaultTo
} from '@benzed/schema'

/******************************************************************************/
// Symbols
/******************************************************************************/

const CONFIG = Symbol('service-store-config')
const QUERY = Symbol('query-queue')

/******************************************************************************/
// Validation
/******************************************************************************/

const isSubclassOfServiceRecord = value => is.subclassOf(value, ServiceRecord)
  ? value
  : new Error('must be a subclass of ServiceRecord')

const validateConfig = new Schema({

  client: typeOf(
    ClientStore,
    required('Must be instanced with a client store.')
  ),

  serviceName: string(
    defaultTo(p =>
      p.data.record &&
      p.data.record.name &&
      p.data.record.name.toLowerCase() + 's'),
    required
  ),

  maxScopedRecords: number(
    defaultTo(10000),
    // range('>=', 100),
    required
  ),

  pollInterval: number(
    defaultTo(5000),
    // range('>=', 250),
    required
  ),

  record: any(
    defaultTo({ value: ServiceRecord, call: false }),
    isSubclassOfServiceRecord,
    required
  )

}, required)

/******************************************************************************/
// Query Queue
/******************************************************************************/

class QueryQueueItem extends PromiseQueue.Item {

  constructor (promiser, data) {
    super(promiser)
    this.data = data
  }

  [EQUALS] (data) {

    data = data instanceof QueryQueueItem
      ? data.data
      : data

    return equals(this.data.method, data.method) &&
      equals(this.data.arg, data.arg)
  }

}

class QueryQueue extends PromiseQueue {

  static Item = QueryQueueItem

}

async function executeQueryWithData () {

  const item = this
  const { data } = item

  const { method, arg, store } = data

  const explicitIds = getIdsFromQuery(arg.query)
  if (explicitIds)
    store::setRecordsStatus(explicitIds, 'fetching')

  let results
  try {
    results = await store.service[method](arg)
  } catch (err) {
    throw err
  }

  // if pagination isn't enabled on this service, we cast the result
  // to look as if it was
  if (is.array(results))
    results = {
      total: results.length,
      limit: (arg.query && arg.query.$limit) || results.length,
      skip: (arg.query && arg.query.$skip) || 0,
      data: results
    }

  const ids = []
  const changes = []

  for (const doc of results.data) {
    const { _id, ...data } = doc
    ids.push(_id)
    changes.push(data)
  }

  const records = store::ensureRecords(ids)
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const data = changes[i]

    record::applyChanges(data)
  }

  results.data = records

  const unscopedIds = explicitIds && explicitIds.filter(id => !ids.includes(id))
  if (unscopedIds)
    store::setRecordsStatus(unscopedIds, 'unscoped')

  const fetchedIds = explicitIds && explicitIds.filter(id => ids.includes(id))
  if (fetchedIds)
    store::setRecordsStatus(fetchedIds, 'fetched')

  return results
}

function ensureFetching (query) {

  const store = this

  const data = {
    method: 'find',
    arg: { query },
    store
  }

  const queue = this[QUERY]
  const { items } = queue
  const index = items::indexOf(data)

  return index > -1
    ? items[index].complete
    : queue.add(executeQueryWithData, data)
}

function requiresFetch (id) {

  const store = this
  const record = store.records.get(id)

  return !record ||
    record.status === 'unfetched'

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
// Events
/******************************************************************************/

function handleEvents () {

  const store = this

  const { service } = store

  const onCreate = doc => {

    const { _id, ...data } = doc
    const [ record ] = store::ensureRecords([ _id ])

    record::applyChanges(data, 'db')

  }

  // const onEdit = data => {
  //   const { _id } = data
  //   const record = store.records.get(_id)
  //   if (record)
  //     record::applyChanges(data, 'db')
  // }
  //
  // const onDelete = data => {
  //   const { _id } = data
  //
  //   const records = new Map()
  //   for (const record of store.records.values())
  //     if (!equals(record._id, _id))
  //       records.set(_id, record)
  //
  //   store.set('records', records)
  // }

  service
    .on('created', onCreate)
  //   .on('patched', onEdit)
  //   .on('updated', onEdit)
  //   .on('removed', onDelete)

}

/******************************************************************************/
// Record Helpers
/******************************************************************************/

function setRecordsStatus (ids, value) {

  // if ids is null, it means the query isn't structured to fetch
  // specific ones
  if (ids === null)
    return

  const store = this

  for (const id of ids) {
    const record = store.records.get(id)
    if (record)
      record.set('status', value)
  }
}

function ensureRecords (ids) {

  const store = this

  const Record = store.ServiceRecord

  const recordArr = []
  let recordMap

  for (const id of ids) {
    let record = (recordMap || store.records).get(id)
    if (!record) {
      record = new Record(id, store)
      recordMap = recordMap || new Map([ ...store.records ])
      recordMap.set(id, record)
    }

    recordArr.push(record)
  }

  if (recordMap)
    store.set('records', recordMap)

  return recordArr
}

function applyChanges (data, field = 'db') {

  const record = this

  const merged = merge(
    record.get([ 'data', field ]),
    data
  )

  record.set([ 'data', field ], merged)
  record.set('status', 'fetched')
}

/******************************************************************************/
// Main
/******************************************************************************/

class ServiceStore extends Store {

  // Data

  [CONFIG] = {};

  [QUERY] = new QueryQueue(10)

  // State

  records = new Map()

  // Short Cuts

  get client () {
    return this[CONFIG].client
  }

  get ServiceRecord () {
    return this[CONFIG].record
  }

  get service () {
    const { client, serviceName } = this[CONFIG]

    return client.service(serviceName)
  }

  // Util

  constructor (config = {}) {
    super()

    this[CONFIG] = validateConfig(config)

    const { client } = this[CONFIG]

    if (client.config.provider === 'socketio')
      this::handleEvents()
  }

  // Actions

  find (query = {}) {
    return this::ensureFetching(query)
  }

  get (id) {

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

    const records = this::ensureRecords(ids)

    return is.array(id)
      ? records
      : unwrap(records)
  }

  untilFetchingComplete () {

    const completes = this[QUERY]
      .items
      .map(item => item.complete)

    return Promise.all(completes)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ServiceStore
