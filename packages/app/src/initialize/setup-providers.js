import is from 'is-explicit'
/******************************************************************************/
// Main
/******************************************************************************/

function setupProviders () {

  const app = this
  let { feathers } = app

  const auth = app.get('auth')
  const ui = app.get('ui')

  // TODO right now rest is required for authentication
  // eventually it wont be, so be on the look out and adjust
  // your tests accordingly
  if (auth || app.rest) {
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
    for (const key in settings)
      feathers.settings[key] = settings[key]
  }

  if (app.rest && ui && ui.favicon) {
    const favicon = require('serve-favicon')
    feathers
      .use(favicon(ui.favicon))
  }

  if (app.socketio) {
    const socketio = require('@feathersjs/socketio')
    const middleware = is(app.socketio, Function)
      ? ::app.socketio
      : null

    feathers.configure(socketio({
      wsEngine: 'uws'
    }, middleware))
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupProviders
