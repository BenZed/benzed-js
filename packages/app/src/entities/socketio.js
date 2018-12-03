
/******************************************************************************/
// Terminate Collection
/******************************************************************************/

function terminateIoConnection () {

  const app = this

  if (app.io)
    return new Promise(resolve => app.io.close(resolve))

}

/******************************************************************************/
// Main
/******************************************************************************/

const socketio = props => {

  const { children, ...options } = props

  return app => {
    app.set('socketio', options)

    app.on('end', app::terminateIoConnection)

    const feathersSocketIO = require('@feathersjs/socketio')

    app.configure(
      feathersSocketIO(options/*, socketMiddleware */)
    )
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default socketio
