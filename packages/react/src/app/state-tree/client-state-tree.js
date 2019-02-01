import feathers from '@feathersjs/feathers'
import FetchService from '@feathersjs/rest-client/lib/fetch'
import SocketIOService from '@feathersjs/transport-commons/client'
import authentication from '@feathersjs/authentication-client'

import StateTree, { action, memoize, state } from '@benzed/state-tree'

import is from 'is-explicit'
import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import { storage } from '../../util'

import { copy } from '@benzed/immutable'
import { milliseconds } from '@benzed/async'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const $$feathers = Symbol('feathers-client-instance')

const CONNECTION_TIMEOUT = 1000

// The initial host doesn't matter, because we change it. However, you seem
// to NEED to supply a valid host string or it throws cryptic errors.
// TODO there's no way socket.io has overlooked this. I must be doing something wrong.
const DUMMY_IO_HOST = 'http://localhost:8080'

const IO_OPT = [DUMMY_IO_HOST, {
  autoConnect: false,
  reconnection: false,
  timeout: CONNECTION_TIMEOUT,
  forceNew: false
}]

const DEFAULT_JWT_KEY = 'benzed-jwt'

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

  if (authEnabled && !auth.storage)
    auth.storage = storage.local

  if (authEnabled && !auth.storageKey)
    auth.storageKey = DEFAULT_JWT_KEY

  if (authEnabled && !auth.cookie)
    auth.cookie = DEFAULT_JWT_KEY

  return auth
}

const mustIncludeProtocol = host =>
  /^https?:\/\//.test(host)
    ? host
    : throw new Error('Host must include http(s) protocol.')

const validateConfig = <object required='ClientStateTree configuration is required.'>

  <array key='hosts'
    cast
    required
    length={['>', 0]}
  >
    <string
      required
      validate={mustIncludeProtocol}
    />
  </array>

  <oneOf key='provider' required>
    {'rest'}{'socketio'}
  </oneOf>

  <bool key='reconnect' default={false} />

  <object key='auth' cast={boolOrStringToToken} validate={authAutoFill} />

</object>

/******************************************************************************/
// Custom Rest Functionality
/******************************************************************************/

class ClientStateTreeFetchService extends FetchService {

  request (options, params) {
    if (!this.tree.host)
      throw new Error('Cannot use service methods, host has not been resolved.')

    return super.request(options, params)
  }

  constructor ({ tree, ...settings }) {
    super(settings)

    this.tree = tree
    this.options = {}

    defineProperty(this, 'base', {
      get () {
        return `${this.tree.host}/${this.name}`
      }
    })
  }
}

function getFetchService (name) {

  const tree = this
  const feathers = tree[$$feathers]
  const { services } = feathers

  if (!services[name])
    services[name] = new ClientStateTreeFetchService({
      name,
      tree,
      connection: fetch
    })

  return services[name]
}

const timeout = (time = CONNECTION_TIMEOUT) =>
  new Promise(
    (resolve, reject) =>
      setTimeout(
        () => reject(new Error('Timeout.')),
        time
      )
  )

async function connectRest () {

  const tree = this
  const feathers = tree[$$feathers]

  const { hosts } = tree.config

  let newHost = null
  for (const host of hosts) {
    const res = await Promise.race([
      feathers.rest(host),
      timeout()
    ]).catch(err => err)

    const status = res.code || res.status
    if (is.number(status) && status < 500) {
      newHost = host
      break
    }
  }

  if (newHost)
    tree.setHost(newHost)

  const hostWasFound = !!newHost
  return hostWasFound

}

/******************************************************************************/
// Custom SocketIO Setup
/******************************************************************************/

class ClientStateTreeSocketIOService extends SocketIOService {

  send (method, ...args) {
    if (!this.tree.host)
      throw new Error('not connected to host')

    return super.send(method, ...args)
  }

  constructor ({ tree, ...settings }) {

    const feathers = tree[$$feathers]

    const events = Object
      .keys(feathers.eventMappings || {})
      .map(method => feathers.eventMappings[method])

    super({
      ...settings,
      events,
      connection: feathers.io,
      method: 'emit'
    })

    this.tree = tree
  }
}

function getSocketIOService (name) {

  const tree = this
  const feathers = tree[$$feathers]

  const { services } = feathers

  if (!services[name])
    services[name] = new ClientStateTreeSocketIOService({
      name,
      tree
    })

  return services[name]
}

function trySocketHost (host) {

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

  const tree = this
  const { hosts } = tree.config

  const feathers = tree[$$feathers]
  const { io } = feathers

  if (io._initialConnectAttempted)
    await milliseconds(CONNECTION_TIMEOUT)

  io._initialConnectAttempted = true

  tree.setHost(null)

  for (const host of hosts) {
    await io::trySocketHost(host)
    if (io.connected)
      break
  }

  tree.setHost(io.connected ? io.io.uri : null)

  return io.connected
}

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperty, freeze } = Object

const createFeathersClient = tree => {

  const { provider, auth, reconnect } = tree.config
  const client = feathers()

  const isSocketIo = provider === 'socketio'
  if (isSocketIo) {
    client.io = io(...IO_OPT)
    client.defaultService = tree::getSocketIOService
  } else {
    client.rest = fetch
    client.defaultService = tree::getFetchService
  }

  if (isSocketIo && reconnect) {
    client.io.on('disconnect', tree.connect)
    client.io.on('connect_error', tree.connect)
    client.io.on('connect_timeout', tree.connect)
  }

  if (auth) client.configure(
    authentication(auth)
  )

  return client
}

async function authenticate (data) {

  const tree = this
  const feathers = tree[$$feathers]

  if (tree.auth?.userId)
    await tree.logout()

  tree.setAuth({ userId: null, status: 'authenticating' })

  let userId = null
  let status = null

  try {
    const { accessToken } = await feathers.authenticate(data)
    const payload = await feathers.passport.verifyJWT(accessToken)
    userId = payload.userId

  } catch ({ name, message, code, errors }) {
    // only fill errors if authentication wasn;t automatic
    if (data.strategy === 'local')
      status = { name, message, code, errors }
  }

  tree.setAuth({ userId, status })

  return userId

}

/******************************************************************************/
// Main
/******************************************************************************/

class ClientStateTree extends StateTree {

  @state
  host = null

  @state
  auth = null;

  @action('host')
  setHost = host => host

  @action('auth')
  setAuth = ({
    status = this.auth?.status,
    userId = this.auth?.userId
  }) => {

    if (!this.config.auth)
      throw new Error('config.auth is not enabled, cannot alter auth state.')

    return {
      status,
      userId
    }
  }

  @memoize(['auth', 'userId'])
  get user () {
    if (!this.config.auth)
      return null

    return this.root.users?.get(this.auth.userId)
  }

  [$$feathers] = null
  config = null

  async connect () {

    const { provider } = this.config
    const isRest = provider === 'rest'

    const connecter = isRest
      ? this::connectRest
      : this::connectSocketIO

    await connecter()

    if (!this.host)
      throw new Error('Host could not be resolved.')

    if (this.config.auth) {
      const { storageKey, storage } = this.config.auth
      const token = storage.getItem(storageKey)

      token && this::authenticate({ stategy: 'jwt', token })
    }

    return this.host
  }

  login (email, password) {

    const { provider, auth } = this.config
    if (!auth)
      throw new Error('config.auth is not enabled, cannot login')

    if (!this.host)
      throw new Error(provider === 'rest'
        ? 'Host not resolved.'
        : 'Not connected to host.'
      )

    const data = { strategy: 'local', email, password }

    return this::authenticate(data)

  }

  logout () {

    const { provider, auth } = this.config
    if (!auth)
      throw new Error('config.auth is not enabled, cannot logout')

    if (!this.host)
      throw new Error(provider === 'rest'
        ? 'Host not resolved.'
        : 'Not connected to host.'
      )

    this.setAuth({ userId: null, status: null })

    return this[$$feathers].logout()
  }

  constructor (config) {

    super()

    defineProperty(this, 'config', {
      value: freeze(validateConfig(config::copy())),
      enumerable: true,
      writable: false
    })

    defineProperty(this, $$feathers, {
      value: createFeathersClient(this),
      writable: false
    })

    if (this.config.auth)
      this.setAuth({ userId: null, status: null })
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ClientStateTree

export {
  $$feathers
}
