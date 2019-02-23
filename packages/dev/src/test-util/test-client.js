
import fs from 'fs-extra'
import path from 'path'

import socketio from 'socket.io-client'
import feathers from '@feathersjs/client'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import fetch from 'isomorphic-fetch'
import FormData from 'form-data'

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

async function upload (url, meta, target = {}) {

  const app = this

  const read = fs.createReadStream(url)

  const { serviceName = 'meta', uploadSuffix = '' } = target

  if (meta === undefined)
    meta = await app
      .service(serviceName)
      .create({
        name: path.basename(url),
        size: fs.statSync(url).size
      })

  const form = new FormData()

  if (meta._id)
    form.append('meta-id', meta._id)

  form.append('file', read)

  const data = {
    method: 'POST',
    headers: form.getHeaders(),
    body: form
  }

  const res = await fetch(app.address + uploadSuffix, data)

  const text = await res.text()

  let json
  try {
    json = JSON.parse(text)
  } catch (err) {
    throw new Error(`did not receive JSON: ${text}`)
  }

  if (json && json.code >= 400)
    throw new Error(json.message)

  return json
}

async function download (id, to, preview = '', suffix = '') {

  const app = this

  const res = await fetch(`${app.address + suffix}/${id}${preview && '?preview=' + preview}`)

  if (res.status >= 400) {
    const json = await res.json()
    throw new Error(json.message)
  }

  const dest = fs.createWriteStream(to)

  return new Promise((resolve, reject) => {
    res.body.pipe(dest)
    res.body.on('error', reject)
    dest.on('finish', resolve)
    dest.on('error', reject)
  })

}

/******************************************************************************/
// Main
/******************************************************************************/

function TestClient (config) {

  const { port, provider, auth } = validateConfig(config)

  const app = feathers()

  app.address = `http://localhost:${port}`

  if (provider === 'socketio') {
    const socket = socketio(app.address, {
      autoConnect: false,
      reconnection: false,
      timeout: 2500,
      forceNew: true
    })
    app.configure(feathers.socketio(socket))

  } else if (provider === 'rest')
    app.configure(
      feathers
        .rest(app.address)
        .fetch(fetch)
    )

  if (auth)
    app.configure(feathers.authentication())

  app.upload = upload
  app.download = download

  if (provider === 'socketio')
    app.connect = connect

  return app
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default TestClient
