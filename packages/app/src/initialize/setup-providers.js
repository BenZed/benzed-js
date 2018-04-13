import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function dummy () {}

function setupProviders () {

  const app = this
  const { feathers } = app

  if (app.socketio) {
    const socketio = require('@feathersjs/socketio')
    const middleware = is(app.socketio, Function)
      ? ::app.socketio
      : dummy
    feathers.configure(socketio(middleware))
  }

  if (app.rest) {
    const rest = require('@feathersjs/rest-client')
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupProviders
