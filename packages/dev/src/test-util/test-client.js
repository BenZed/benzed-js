import socketio from 'socket.io-client'
import feathers from '@feathersjs/client'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import fetch from 'isomorphic-fetch'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validation
/******************************************************************************/

const validateConfig = <object key='config' plain default={{}}>
  <number key='port' default={5000} />
  <string key='provider' default='socketio' />
  <bool key='auth' default={false} />
</object>

/******************************************************************************/
// Helper
/******************************************************************************/

function connect () {

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

function upload () {
  throw new Error('not yet implemented')
}

/******************************************************************************/
// Main
/******************************************************************************/

function TestClient (config) {

  const { port, provider, auth } = validateConfig(config)

  const app = feathers()

  const address = `http://localhost:${port}`

  if (provider === 'socketio') {
    const socket = socketio(address, {
      autoConnect: false,
      reconnection: false,
      timeout: 2500,
      forceNew: true
    })
    app.configure(feathers.socketio(socket))

  } else if (provider === 'rest')
    app.configure(feathers.rest(address).fetch(fetch))

  if (auth)
    app.configure(feathers.authentication())

  app.upload = upload

  if (provider === 'socketio')
    app.connect = connect

  return app
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default TestClient
