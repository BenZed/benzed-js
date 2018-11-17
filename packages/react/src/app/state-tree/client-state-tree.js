import feathers from '@feathersjs/feathers'
import FetchService from '@feathersjs/rest-client/lib/fetch'
import SocketIOService from '@feathersjs/transport-commons/client'
import authentication from '@feathersjs/authentication-client'

import is from 'is-explicit'
import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import StateTree from '../../state-tree'
import { isClient } from '../../util'

import { copy } from '@benzed/immutable'
import { until } from '@benzed/async'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const $$feathers = Symbol('feathers-client-instance')

const CONNECTION_TIMEOUT = 500

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

  if (isClient() && authEnabled && !auth.storage)
    auth.storage = window.localStorage

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

const validateConfig = <object required='ClientStore configuration is required.'>

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

async function connectRest () {

  const tree = this
  const feathers = tree[$$feathers]

  const { hosts } = tree.config

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
    tree('host').set(newHost)

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
  const feathers = tree[$$feathers]

  const { hosts } = tree.config
  const { io } = feathers

  for (const host of hosts) {
    await io::trySocketHost(host)
    if (io.connected)
      break
  }

  tree('host').set(io.connected ? io.io.uri : null)

  return io.connected
}

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperty, freeze } = Object

const createFeathersClient = tree => {

  const { provider, auth } = tree.config
  const client = feathers()

  if (provider === 'rest') {
    client.rest = fetch
    client.defaultService = tree::getFetchService
  } else {
    client.io = io(...IO_OPT)
    client.defaultService = tree::getSocketIOService
  }

  if (auth) client.configure(
    authentication(auth)
  )

  return client
}

async function authenticate (data) {

  const tree = this
  const feathers = tree[$$feathers]

  const { set: setAuth } = tree('auth')

  setAuth({ userId: null, status: 'authenticating' })

  if (tree.userId)
    await tree.logout()

  let userId = null
  let status = null

  try {
    const { accessToken } = await feathers.authenticate(data)
    const payload = await feathers.passport.verifyJWT(accessToken)
    userId = payload.userId

  } catch ({ name, message, code, errors }) {
    status = { name, message, code, errors }
  }

  setAuth({ userId, status })

  return userId

}

/******************************************************************************/
// Setup
/******************************************************************************/

const STATE = {
  host: null,
  auth: {
    status: null,
    userId: null
  }
}

const ACTIONS = {

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

  },

  login (email, password) {

    const { provider } = this.config

    if (!this.host)
      throw new Error(provider === 'rest'
        ? 'Host not resolved.'
        : 'Not connected to host.'
      )

    const data = { strategy: 'local', email, password }

    return this::authenticate(data)

  },

  logout () {

    const { provider } = this.config

    if (!this.host)
      throw new Error(provider === 'rest'
        ? 'Host not resolved.'
        : 'Not connected to host.'
      )

    this('auth').set({ userId: null, status: null })

    return this[$$feathers].logout()
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

function ClientStateTree (config) {

  // config = config |> copy |> validateConfig |> freeze
  config = freeze(validateConfig(copy(config)))

  const state = { ...STATE }
  const actions = { ...ACTIONS }

  if (!config.auth) {
    delete state.auth
    delete actions.login
    delete actions.logout
  }
  // const { connect, login, logout } = actions

  const tree = new StateTree(
    state,
    actions
  )

  defineProperty(tree, 'config', { value: config, enumerable: true })
  defineProperty(tree, $$feathers, { value: createFeathersClient(tree) })

  return tree

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ClientStateTree

export {
  $$feathers
}
