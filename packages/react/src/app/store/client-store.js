import is from 'is-explicit'

import feathers from '@feathersjs/feathers'
import FetchService from '@feathersjs/rest-client/lib/fetch'
import SocketIOService from '@feathersjs/transport-commons/client'
import authentication from '@feathersjs/authentication-client'

import { Schema, arrayOf, string, object, required, oneOf, cast } from '@benzed/schema'
import { until } from '@benzed/async'

import Store from '../../store'
import { isClient } from '../../util'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

/******************************************************************************/
// Data
/******************************************************************************/

const FEATHERS = Symbol('feathers-client-instance')

const CONFIG = Symbol('configuration')

const CONNECTION_TIMEOUT = 500

// The initial host doesn't matter, because we change it. However, you seem
// to NEED to supply a valid host string or it throws errors.
// TODO there's no way socket.io has overlooked this. I must be doing something wrong.
const DUMMY_IO_HOST = 'http://localhost:80'

const IO_OPT = [DUMMY_IO_HOST, {
  autoConnect: false,
  reconnection: false,
  timeout: CONNECTION_TIMEOUT,
  forceNew: false
}]

const DEFAULT_JWT_KEY = 'benzed-jwt'

/******************************************************************************/
// Shortcuts
/******************************************************************************/

const { freeze, defineProperty } = Object

/******************************************************************************/
// Validation
/******************************************************************************/

const boolOrStringToToken = value => value === true
  ? { storageKey: DEFAULT_JWT_KEY, cookie: DEFAULT_JWT_KEY }
  : value === false
    ? null
    : is.string(value)
      ? { storageKey: value, cookie: value }
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

    auth: object(
      cast(boolOrStringToToken)
    )
  },

  required('ClientStore configuration is required.')
)

/******************************************************************************/
// Custom Rest Functionality
/******************************************************************************/

class ClientStoreFetchService extends FetchService {

  request (options, params) {

    if (!this.client.host)
      throw new Error('Cannot use service methods, host has not been resolved.')

    return super.request(options, params)
  }

  constructor ({ client, ...settings }) {
    super(settings)

    this.client = client
    this.options = {}

    function get () {
      return `${this.client.host}/${this.name}`
    }

    defineProperty(this, 'base', { get })

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

  send (method, ...args) {
    if (!this.client.host)
      throw new Error('not connected to host')

    return super.send(method, ...args)
  }

  constructor ({ client, ...settings }) {

    const feathers = client[FEATHERS]

    const events = Object
      .keys(feathers.eventMappings || {})
      .map(method => feathers.eventMappings[method])

    super({
      ...settings,
      events,
      connection: feathers.socket,
      method: 'emit'
    })

    this.client = client
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
// Helper
/******************************************************************************/

async function connectRest () {

  const client = this
  const feathers = client[FEATHERS]

  const { hosts } = client.config

  let newHost = null

  for (const host of hosts) {
    const res = await feathers.rest(host).catch(err => err)

    const status = res.code || res.status
    if (is.number(status) && status < 500) {
      newHost = host
      break
    }
  }

  if (newHost)
    client.set('host', newHost)

  const hostWasFound = !!newHost
  return hostWasFound
}

function tryHost (host) {

  let _resolve, _reject

  const socket = this
  const { io } = socket

  io.uri = host

  const addEventHandlers = (resolve, reject) => {

    _resolve = resolve
    _reject = reject

    socket.once('connect', _resolve)
    socket.once('disconnect', _reject)
    socket.once('connect_error', _reject)
    socket.once('connect_timeout', _reject)

    socket.connect()
  }

  const removeEventHandlers = () => {

    socket.removeListener('connect', _resolve)
    socket.removeListener('disconnect', _reject)
    socket.removeListener('connect_error', _reject)
    socket.removeListener('connect_timeout', _reject)

  }

  return new Promise(addEventHandlers)
    .then(removeEventHandlers)
    .catch(removeEventHandlers)

}

async function connectSocketIO () {

  const client = this
  const feathers = client[FEATHERS]

  const { hosts } = client.config
  const { socket } = feathers

  for (const host of hosts) {
    await socket::tryHost(host)
    if (socket.connected)
      break
  }

  if (socket.connected)
    client.set('host', socket.io.uri)

  return socket.connected

}

/******************************************************************************/
// Exports
/******************************************************************************/

class ClientStore extends Store {

  [FEATHERS] = null;

  [CONFIG] = null

  get config () {
    return this[CONFIG]
  }

  // State

  host = null

  userId = null

  // State Getters

  get user () {
    // match user id to user service record
  }

  // Actions

  async connect () {

    const { provider } = this.config
    const isRest = provider === 'rest'

    if (!this.host) {
      const connect = isRest
        ? this::connectRest
        : this::connectSocketIO

      await until({
        condition: connect,
        interval: CONNECTION_TIMEOUT
      })

    }

    return this.host
  }

  async login (email, password) {
    throw new Error('Not yet implemented')
  }

  async logout () {
    throw new Error('Not yet implemented')
  }

  // Util

  constructor (config) {
    super()

    this[FEATHERS] = feathers()
    this[CONFIG] = freeze(validateConfig(config))

    const { provider, auth } = this[CONFIG]
    if (provider === 'rest') {
      this[FEATHERS].rest = fetch
      this[FEATHERS].defaultService = this::getClientStoreFetchService
    } else {
      this[FEATHERS].socket = io(...IO_OPT)
      this[FEATHERS].defaultService = this::getClientStoreSocketIOService
    }

    if (auth) {
      const storage = isClient
        ? window.localStorage
        : undefined

      this[FEATHERS].configure(
        authentication({
          ...auth,
          storage
        })
      )
    }
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ClientStore
