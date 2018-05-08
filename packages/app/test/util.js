import socketio from 'socket.io-client'
import feathers from '@feathersjs/client'
import path from 'path'

export const CONFIG_URL = path.resolve(__dirname, './config')

export const CONFIG_OBJ = {
  'test-value': 'foobar',
  rest: {
    public: path.join(__dirname, './public'),
    favicon: path.join(__dirname, './public/favicon.ico')
  },
  port: 4567
}

export function testClient (numberOrApp = 5000) {

  const port = typeof numberOrApp === 'object'
    ? numberOrApp.get('port')
    : numberOrApp

  const socket = socketio(`http://localhost:${port}`, {
    autoConnect: false,
    reconnection: false,
    timeout: 2500,
    forceNew: true
  })

  const app = feathers()
    .configure(feathers.socketio(socket))

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
