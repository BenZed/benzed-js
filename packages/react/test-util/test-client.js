import socketio from 'socket.io-client'
import feathers from '@feathersjs/client'
import auth from '@feathersjs/authentication-client'

/******************************************************************************/
// Exports
/******************************************************************************/

export default function testClient (numberOrApi = 5000) {

  const api = typeof numberOrApi === 'object' ? numberOrApi : null
  const port = api
    ? api.get('port')
    : numberOrApi

  const socket = socketio(`http://localhost:${port}`, {
    autoConnect: false,
    reconnection: false,
    timeout: 2500,
    forceNew: true
  })

  const app = feathers()
    .configure(feathers.socketio(socket))

  const autoAuth = api && api.get('auth')
  if (autoAuth)
    app.configure(auth())

  app.connect = function () {

    let _resolve, _reject

    const { io } = this

    return new Promise((resolve, reject) => {

      _resolve = resolve
      _reject = reject

      io.once('connect', _resolve)
      io.once('disconnect', _reject)
      io.once('connect_error', _reject)
      io.once('connect_timeout', _reject)

      io.connect()

    }).then(result => {

      io.removeListener('connect', _resolve)
      io.removeListener('disconnect', _reject)
      io.removeListener('connect_error', _reject)
      io.removeListener('connect_timeout', _reject)

      return result
    })

  }

  return app
}
