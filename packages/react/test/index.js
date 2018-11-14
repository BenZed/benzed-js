import { clearConsole } from '@benzed/dev'
import { addPath } from 'module-alias'
import path from 'path'
import 'styled-components-test-utils/lib/chai'
import 'colors'
import is from 'is-explicit'
import getPort from './get-port'
/******************************************************************************/
// Global
/******************************************************************************/

/* global before after */

// TEMP this should be replaced with our jsx app markup that will exist in @benzed/dev
global.createTestApi = (config, test) => {

  if (!is.plainObject(config))
    throw new Error('TestApi config must be a plain object')

  const state = {}

  before(async () => {

    const feathers = require('@feathersjs/feathers')
    const express = require('@feathersjs/express')
    const socketio = require('@feathersjs/socketio')
    const auth = require('@feathersjs/authentication')
    const local = require('@feathersjs/authentication-local')
    const jwt = require('@feathersjs/authentication-jwt')
    const compress = require('compression')
    const cors = require('cors')
    const memory = require('feathers-memory')
    const { randomBytes } = require('crypto')
    const { authenticate } = auth.hooks

    if (config.rest || config.auth)
      state.app = express(feathers())
        .configure(express.rest())
        .options('*', cors())

        .use(cors())
        .use(compress())

        .use(express.json())
        .use(express.urlencoded({ extended: true }))

    if (config.socketio) {
      state.app = state.app || feathers()
      state.app.configure(socketio())
    }

    if (config.auth) {
      const secret = randomBytes(48).toString('hex')
      state.app
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

    if (config.auth && !config?.services?.users) {
      config.services = config.services || {}
      config.services.users = {}
    }

    if (config.services) for (const name in config.services) {

      if (!config.services[name])
        continue

      state.app.use(`/${name}`, memory())

      if (config.auth)
        state.app
          .service(name)
          .hooks({
            before: {
              all: [ authenticate('jwt') ]
            }
          })
    }

    const port = await getPort(config.port)

    return new Promise((resolve, reject) => {

      state.address = `http://localhost:${port}`
      state.port = port
      state.listener = state.app.listen(port)
      state.listener.once('listening', resolve)

      setTimeout(() => reject(new Error('TestApi failed to listen')), 100)

    })

  })

  after(async () => {

    if (state.app.io)
      await new Promise(resolve => state.app.io.close(resolve))

    if (state.listener)
      await new Promise(resolve => state.listener.close(resolve))

  })

  test(state)

}

/******************************************************************************/
// Execute
/******************************************************************************/

clearConsole()
addPath(path.resolve(__dirname, '../'))

/******************************************************************************/
// Export
/******************************************************************************/
