import is from 'is-explicit'

import feathers from '@feathersjs/feathers'
import FetchService from '@feathersjs/rest-client/lib/fetch'
import SocketIoService from '@feathersjs/transport-commons/client'

import { Schema, arrayOf, string, required, oneOf, cast, length } from '@benzed/schema'
import { until } from '@benzed/async'

import Store from '../../store'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

/******************************************************************************/
// Data
/******************************************************************************/

const FEATHERS = Symbol('feathers-client-instance')

const CONFIG = Symbol('configuration')

/******************************************************************************/
// Validation
/******************************************************************************/

const boolToDefaultToken = value => value === true
  ? 'benzed-jwt'
  : value === false
    ? null
    : value

const validateConfig = new Schema(
  {
    hosts: arrayOf(
      string,
      required
    ),

    provider: oneOf(
      ['rest', 'socketio'],
      required
    ),

    auth: string(
      cast(boolToDefaultToken),
      length('>=', 3, 'token key must be at least 3 characters long')
    )
  },

  required('ClientStore configuration is required.')
)

/******************************************************************************/
// Custom Rest Functionality
/******************************************************************************/

class ClientStoreFetchService extends FetchService {

  constructor ({ client, ...settings }) {
    super(settings)

    function get () {
      return `${client.host}/${this.name}`
    }

    Object.defineProperty(this, 'base', { get })
  }

}

function getClientStoreFetchService (name) {

  const client = this
  const feathers = client[FEATHERS]

  const { services } = feathers

  if (!services[name])
    services[name] = new ClientStoreFetchService({
      name,
      client,
      connection: fetch
    })

  return services[name]
}

/******************************************************************************/
// Custom SocketIO Setup
/******************************************************************************/

class ClientStoreSocketIoService extends SocketIoService {

}

function getClientStoreSocketIoService (name) {

  const client = this
  const feathers = client[FEATHERS]

  const { services } = feathers

  if (!services[name]) {

    const events = Object.keys(feathers.eventMappings || {})
      .map(method => feathers.eventMappings[method])

    services[name] = new ClientStoreSocketIoService({
      name,
      events,
      connection: feathers.io,
      method: 'emit'
    })
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

class ClientStore extends Store {

  [FEATHERS] = null;

  [CONFIG] = null

  host = null

  get config () {
    return this[CONFIG]
  }

  service (name) {
    return this[FEATHERS].service(name)
  }

  constructor (config) {

    super()

    this[FEATHERS] = feathers()
    this[CONFIG] = Object.freeze(validateConfig(config))

    const { provider, auth } = this[CONFIG]
    if (provider === 'rest') {
      feathers.rest = fetch
      feathers.defaultService = this::getClientStoreFetchService
    } else {
      feathers.io = io()
      feathers.defaultService = this::getClientStoreSocketIoService
    }
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ClientStore
