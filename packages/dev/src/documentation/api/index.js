import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'

import compress from 'compression'
import cors from 'cors'
import is from 'is-explicit'
import { inspect } from 'util'

import { set, merge } from '@benzed/immutable'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

import * as services from './services'
import colors from 'colors/safe'
// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validate
/******************************************************************************/

const validateSettings = <object key='app' plain strict={{ error: true }}>

  <number key='port' required range={[ 1024, 65535 ]} cast default={5100}/>

  <object key='rest' plain />
  <object key='socketio' plain />

  <object key='docs' plain >
    <string key='root' required />
  </object>

</object>

/******************************************************************************/
// Added Methods
/******************************************************************************/

async function start () {

  const app = this

  const port = app.get('port')
  const listener = app.listener = app.listen(port)

  await new Promise(resolve => listener.once('listening', resolve))

  return listener
}

async function end () {

  const app = this

  if (app.listener) {
    await new Promise(resolve => app.listener.close(resolve))
    app.listener = null
  }

}

const $$logtimestamp = Symbol('log-timestamp')

const time = () => {
  const date = new Date()
  return `` +
    `${date.getMonth() + 1}/${date.getDate()}-${date.getHours()}:` +
    `${date.getMinutes()}:${date.getSeconds()}`
}

function log (strings, ...params) {

  const arr = []
  for (let i = 0; i < strings.length; i++) {
    arr.push(strings[i])
    if (i < params.length)
      arr.push(inspect(params[i]))
  }

  const now = time()

  console.log(
    now === this[$$logtimestamp]
      ? colors.gray(now)
      : now,
    arr.join('')
  )

  this[$$logtimestamp] = now
}

const { entries } = Object

/******************************************************************************/
// Get Settings
/******************************************************************************/

const getSettings = env => {

  let settings = null

  try {
    settings = require(`../settings-${env}`).default
  } catch (err) {
    console.warn(`could not retrive settings for env '${env}': ${err.message} ${err.stack}`)
  }

  return settings

}

/******************************************************************************/
// Main
/******************************************************************************/

const api = (settings = process.env.NODE_ENV || 'production') => {

  if (is.string(settings))
    settings = getSettings(settings)

  if (is.plainObject(settings))
    settings = merge(getSettings('default'), settings)

  else
    throw new Error(`could not resolve api layout`)

  settings = validateSettings(settings)

  // Rest
  const app = express(feathers())
    .configure(express.rest())
    .options('*', cors())

    .use(cors())
    .use(compress())

    .use(express.json())
    .use(express.urlencoded({ extended: true }))

  // Apply Settings
  for (const [ key, value ] of entries(settings))
    app.settings::set.mut([ key ], value)

  // Services and Middleware
  for (const name in services) {
    const service = services[name]
    const settings = app.settings[name]

    app::service(settings)
  }

  // Add Socket IO
  // TODO

  // Add Serve UI
  // TODO

  // Error Handling
  app.use(express.errorHandler({
    html: false,
    logger: false
  }))

  // Add Shortcuts
  app.start = start
  app.end = end
  app.log = log

  return app
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default api
