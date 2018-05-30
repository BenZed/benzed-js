import is from 'is-explicit'

import feathers from '@feathersjs/feathers'
import FetchService from '@feathersjs/rest-client/lib/fetch'
import SocketIOService from '@feathersjs/transport-commons/client'

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

const IO_OPT = {
  autoConnect: false,
  reconnection: false,
  timeout: 2500,
  forceNew: true
}
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

class ClientStoreSocketIOService extends SocketIOService {

  constructor ({ client, ...settings }) {

    const feathers = client[FEATHERS]

    const events = Object
      .keys(feathers.eventMappings || {})
      .map(method => feathers.eventMappings[method])

    super({
      ...settings,
      events,
      connection: feathers.io,
      method: 'emit'
    })

  }

}

function getClientStoreSocketIOService (name) {

  const client = this
  const feathers = client[FEATHERS]

  const { services } = feathers

  if (!services[name])
    services[name] = new ClientStoreSocketIOService({
      name,
      client
    })

  return services[name]

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
      this[FEATHERS].rest = fetch
      this[FEATHERS].defaultService = this::getClientStoreFetchService
    } else {
      this[FEATHERS].io = io(IO_OPT)
      this[FEATHERS].defaultService = this::getClientStoreSocketIOService
      this[]
    }
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ClientStore
