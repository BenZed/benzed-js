import is from 'is-explicit'
import { merge } from '@benzed/immutable'

/******************************************************************************/
// Main
/******************************************************************************/

function setupProviders () {

  const app = this
  let { feathers } = app

  const configRest = app.get('rest')
  if (configRest) {
    const express = require('@feathersjs/express')
    const compress = require('compression')
    const cors = require('cors')

    const { settings } = feathers

    feathers = app.feathers = express(feathers)
    feathers
      .options('*', cors())
      .use(cors())
      .use(compress())

      .use(express.json())
      .use(express.urlencoded({ extended: true }))

    // Move settings to deferred feathers object
    feathers.settings = merge(feathers.settings, settings)
  }

  if (configRest && configRest.favicon) {
    const favicon = require('serve-favicon')
    feathers
      .use(favicon(configRest.favicon))
  }

  const configIo = app.get('socketio')
  if (configIo) {
    const socketio = require('@feathersjs/socketio')
    const middleware = is(app.socketio, Function)
      ? ::app.socketio
      : null

    const options = {
      wsEngine: 'uws',
      ...configIo
    }

    feathers.configure(socketio(options, middleware))
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupProviders
