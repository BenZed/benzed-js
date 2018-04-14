import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

function setupStatic (express) {

  const app = this

  const { feathers } = app

  const ui = app.get('ui')
  if (!ui)
    return

  if (ui.favicon) {
    const favicon = require('serve-favicon')
    feathers
      .use(favicon(ui.favicon))
  }

  feathers
    .use(express.static(ui.public))
}

/******************************************************************************/
// Main
/******************************************************************************/

function setupProviders () {

  const app = this
  let { feathers } = app

  if (app.rest) {
    const express = require('@feathersjs/express')
    const compress = require('compression')
    const cors = require('cors')

    feathers = app.feathers = express(feathers)
    feathers
      .options('*', cors())
      .use(cors())
      .use(compress())

      .use(express.json())
      .use(express.urlencoded({ extended: true }))

    feathers::setupStatic(express)
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
