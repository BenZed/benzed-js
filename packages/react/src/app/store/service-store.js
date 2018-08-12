import ServiceRecord from './service-record'
import Store from '../../store/store'
import ClientStore from './client-store'
import is from 'is-explicit'

import { PromiseQueue } from '@benzed/async'
import {
  Schema, required, string, any, typeOf, number, defaultTo
} from '@benzed/schema'
import { copy, equals, EQUALS, indexOf } from '@benzed/immutable'
import { wrap } from '@benzed/array'

/******************************************************************************/
// Symbols
/******************************************************************************/

const CONFIG = Symbol('service-store-config')
const QUERY = Symbol('query-queue')

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
      equals(this.data.query, data.query)
  }

}

class QueryQueue extends PromiseQueue {

  static Item = QueryQueueItem

}

async function executeQueryWithData () {

  const item = this
  const { data } = item

  const { method, arg, store } = data

  let results = await store.service[method](arg)

  if (is.array(results))
    results = {
      total: results.length,
      limit: (arg.query && arg.query.$limit) || results.length,
      skip: (arg.query && arg.query.$skip) || 0,
      data: results
    }

  // TEMP
  results.data = results.data.map(r => (r.scoped = true) && r)

  results.data = store::ensureRecords(results.data)

  return results
}

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
// Dangling Private
/******************************************************************************/

function ensureFindInQueue (query) {

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

function ensureRecords (records) {

  const store = this
  // TEMP should be creating service record instances
  const newArr = []
  const newMap = copy(store.records)

  for (const idOrData of records) {
    const isData = is.plainObject(idOrData)
    const id = isData
      ? idOrData._id
      : idOrData

    const record = isData
      ? idOrData
      : newMap.get(id) || { _id: id, scoped: false, body: null }

    newArr.push(record)
  }

  for (const record of newArr)
    newMap.set(record._id, record)

  store.set('records', newMap)

  return newArr
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

  // ShortCuts

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
  }

  // Actions

  find (query = {}) {
    return this::ensureFindInQueue(query)
  }

  get (id = null) {

    const ids = wrap(id)

    this::ensureFindInQueue({ _id: { $in: ids } })

    // TEMP should return ServiceRecord instance
    const records = this::ensureRecords(ids)

    return is.array(id)
      ? records
      : records[0]
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ServiceStore
