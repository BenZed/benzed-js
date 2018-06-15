import is from 'is-explicit'

import feathers from '@feathersjs/feathers'
import FetchService from '@feathersjs/rest-client/lib/fetch'
import SocketIOService from '@feathersjs/transport-commons/client'
import authentication from '@feathersjs/authentication-client'

import { Schema, arrayOf, string, object, required, oneOf, cast } from '@benzed/schema'
import { until } from '@benzed/async'

import Store, { task } from '../../store'
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
  ? { }
  : value === false
    ? null
    : is.string(value)
      ? { storageKey: value, cookie: value }
      : value

const authAutoFill = auth => {

  const authEnabled = is.object(auth)

  if (isClient && authEnabled && !auth.storage)
    auth.storage = window.localStorage

  if (authEnabled && !auth.storageKey)
    auth.storageKey = DEFAULT_JWT_KEY

  if (authEnabled && !auth.cookie)
    auth.cookie = DEFAULT_JWT_KEY

  return auth
}

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
      cast(boolOrStringToToken),
      authAutoFill
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

// Why a seperate function? So it can be used for token auth on connect, as well
async function authenticate (data) {

  const client = this
  const feathers = client[FEATHERS]

  let userId = null

  if (client.userId)
    await client.logout()

  const { accessToken } = await feathers.authenticate(data)
  const payload = await feathers.passport.verifyJWT(accessToken)

  userId = payload.userId

  client.set('userId', userId)

  return userId

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
    throw new Error('not yet implemented')
  }

  // Tasks

  @task
  async connect () {

    const { provider } = this.get('config')
    const isRest = provider === 'rest'

    if (!this.get('host')) {
      const connect = isRest
        ? this.store::connectRest
        : this.store::connectSocketIO

      await until({
        condition: connect,
        interval: CONNECTION_TIMEOUT
      })
    }

    return this.get('host')
  }

  @task
  login (email, password) {

    const { auth, provider } = this.get('config')
    if (!auth)
      throw new Error('Cannot login, auth is not enabled')

    const host = this.get('host')
    if (!host)
      throw new Error(`Cannot login, ` + (provider === 'rest'
        ? 'host has not been resolved.'
        : 'not connected to host.'))

    const data = { strategy: 'local', email, password }

    return this.store::authenticate(data)
  }

  @task
  logout () {

    const { auth, provider } = this.get('config')
    if (!auth)
      throw new Error('Cannot logout, auth is not enabled')

    const host = this.get('host')
    if (!host)
      throw new Error(`Cannot logout, ` + (provider === 'rest'
        ? 'host has not been resolved.'
        : 'not connected to host.'))

    this.set('userId', null)
    this.set(['login', 'error'], null)

    // throw new Error('Not yet implemented.')
    const feathers = this.get(FEATHERS)
    return feathers.logout()
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

    if (auth)
      this[FEATHERS].configure(
        authentication(auth)
      )
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ClientStore
