import is from 'is-explicit'
import { merge } from '@benzed/immutable'

import { isEnabled } from '../configure'

/******************************************************************************/
// Helper
/******************************************************************************/

function setupSocketMiddleware (io) {

  const app = this

  if (is.func(app.setupSocketMiddleware))
    app.setupSocketMiddleware(io)

  for (const name in app.feathers.services) {

    const service = app.feathers.services[name]

    if (service && is.func(service.setupSocketMiddleware))
      service.setupSocketMiddleware(
        io,
        app
      )
  }
}

/******************************************************************************/
// Main
/******************************************************************************/

function setupProviders () {

  const app = this

  const configRest = app.get('rest')
  if (isEnabled(configRest)) {
    const express = require('@feathersjs/express')
    const compress = require('compression')
    const cors = require('cors')

    const settings = { ...app.feathers.settings }

    app.feathers = express(app.feathers)
    app.feathers
      .configure(express.rest())
      .options('*', cors())
      .use(cors())
      .use(compress())

      .use(express.json())
      .use(express.urlencoded({ extended: true }))

    // Move settings to deferred feathers object
    app.feathers.settings = merge(app.feathers.settings, settings)
  }

  const configIo = app.get('socketio')
  if (isEnabled(configIo)) {
    const socketio = require('@feathersjs/socketio')
    const middleware = app::setupSocketMiddleware

    const options = {
      // wsEngine: 'uws',
      ...configIo
    }
    app.feathers.configure(socketio(options, middleware))
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupProviders
