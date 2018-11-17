import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'
import socketio from '@feathersjs/socketio'
import auth from '@feathersjs/authentication'
import local from '@feathersjs/authentication-local'
import jwt from '@feathersjs/authentication-jwt'
import compress from 'compression'
import cors from 'cors'
import memory from 'feathers-memory'
import { randomBytes } from 'crypto'
import is from 'is-explicit'
import getPort from './get-port'

/* global before after */
/******************************************************************************/
// Hooks
/******************************************************************************/

const { authenticate } = auth.hooks

// This is a quick replacement for the cast-query-ids hook that needs updating
const fixQueryIds = ctx => {

  const p = ctx.params
  if (!p.query || !is.defined(p.query._id))
    return

  if (!is.plainObject(p.query._id))
    p.query._id = Number(p.query._id)

  else if (p.query._id.$in)
    p.query._id.$in = p.query._id.$in.map(id => Number(id))

  return ctx
}

/******************************************************************************/
// Setup
/******************************************************************************/

function setupProvider (config) {

  let api
  if (config.rest || config.auth)
    api = express(feathers())
      .configure(express.rest())
      .options('*', cors())

      .use(cors())
      .use(compress())

      .use(express.json())
      .use(express.urlencoded({ extended: true }))

  if (config.socketio) {
    api = api || feathers()
    api.configure(socketio())
  }

  return api

}

function setupServices (config) {

  const api = this

  if (config.auth && !config?.services?.users) {
    config.services = config.services || {}
    config.services.users = {}
  }

  if (config.services) for (const name in config.services) {

    if (!config.services[name])
      continue

    api.use(`/${name}`, memory({ id: '_id' }))
    const service = api.service(name)

    service.hooks({
      before: {
        all: fixQueryIds
      }
    })

    if (config.auth)
      service
        .hooks({
          before: {
            all: authenticate('jwt')
          }
        })
  }

  if (config.auth)
    api.service('users')
      .hooks({
        before: {
          create: local.hooks.hashPassword()
        }
      })
}

function setupAuth (config) {
  const api = this

  if (config.auth) {
    const secret = randomBytes(48).toString('hex')
    api
      .configure(auth({ secret }))
      .configure(local())
      .configure(jwt())
      .service('authentication')
      .hooks({
        before: {
          create: authenticate(['jwt', 'local']),
          remove: authenticate('jwt')
        }
      })
  }
}

function setupChannels (config) {
  const api = this

  if (!config.socketio)
    return

  api.on('connection', connection => {
    api.channel('anonymous')
      .join(connection)
  })

  if (config.auth)
    api.on('login', (payload, { connection }) => {

      // client may be using rest
      if (!connection)
        return

      api.channel('anonymous')
        .leave(connection)

      api.channel('authenticated')
        .join(connection)

    })

  const channel = config.auth
    ? 'authenticated'
    : 'anonymous'

  api.publish(() => api.channel(channel))

}

/******************************************************************************/
// LifeCycle
/******************************************************************************/

async function start (config) {
  const state = this
  const port = await getPort(config.port)

  return new Promise((resolve, reject) => {
    state.address = `http://localhost:${port}`
    state.port = port
    state.listener = state.api.listen(port)
    state.listener.once('listening', resolve)
    setTimeout(() => reject(new Error('TestApi failed to listen')), 100)
  })
}

async function end () {

  const state = this

  if (state.api.io)
    await new Promise(resolve => state.api.io.close(resolve))

  if (state.listener)
    await new Promise(resolve => state.listener.close(resolve))

}

/******************************************************************************/
// Main
/******************************************************************************/

const createTestApi = (config, test) => {

  if (!is.plainObject(config))
    throw new Error('TestApi config must be a plain object')

  const state = {}

  before(function () {

    this.timeout(5000)

    state.api = setupProvider(config)
    state.api::setupAuth(config)
    state.api::setupServices(config)
    state.api::setupChannels(config)

    if (config.rest)
      state.api.use(express.errorHandler())

    return state::start(config)
  })

  after(state::end)

  test(state)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default createTestApi
