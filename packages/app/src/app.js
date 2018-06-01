import feathers from '@feathersjs/feathers'
import { get, set } from '@benzed/immutable'
import { milliseconds } from '@benzed/async'
import is from 'is-explicit'

import {
  validateMode,
  validateConfig,
  validateClass
} from './configure'

import {
  setupProviders,
  setupAuthentication,
  setupServices,
  setupMiddleware,
  connectToDatabase
} from './initialize'

/******************************************************************************/
// Bens super duper backend class
/******************************************************************************/

// This is going to be my defacto class for creating backends out of modules I'm
// familiar. It will wrap a feathers app, take a configuration object that determines
// how complex it is. This will make it easier to test, and reduce the amount of
// testing required for projects that depend on this repo.

// The App should be able to serve anything from static sites to complex web apps:
// server-side rendering of a react ui
// socket.io provider
// rest provider
// user authentication
// file service
// real time editing service
// object log service
// task manager / process handler ? <-- dunno what I'm going to call it yet.
// version/paper trail service
// scalability <-- no idea how

// sensible handling of added services or rest/socket middleware

/******************************************************************************/
// Data
/******************************************************************************/

const EXIT_ERROR = 1

const KILL_WAIT = 500 // ms

/******************************************************************************/
// Helper
/******************************************************************************/

async function kill () {

  const app = this

  if (app)
    await app.end()

  await milliseconds(KILL_WAIT)

  process.exit(EXIT_ERROR)
}

/******************************************************************************/
// Main
/******************************************************************************/

// The App class itself is an abstractish class that should be extended to
// add services/middleware

class App {

  static async run (config) {

    const App = this
    let app

    try {
      app = new App(config)
    } catch (err) {
      console.log(`app could not be configured: \n${err}`)
      return app::kill()
    }

    try {
      await app.initialize()
    } catch (err) {

      app.log`app could not be initialized: \n${err}`
      return app::kill()
    }

    try {
      await app.start()
      app.log`app listening on ${app.get('port')}`

    } catch (err) {
      app.log`app could not start: \n${err}`
      return app::kill()
    }

  }

  listener = null
  database = null

  constructor (configInput, mode = process.env.NODE_ENV || 'default') {

    this.mode = validateMode(mode)

    const config = validateConfig(configInput, mode)

    // create feathers app, apply config
    this.feathers = feathers()

    for (const key in config)
      this.set(key, config[key])

    validateClass(this)

  }

  // Setup Methods

  async initialize () {
    this::setupProviders()
    this::setupAuthentication()
    await this::connectToDatabase()
    this::setupServices()
    this::setupMiddleware()

    if (is.func(this.onInitialize))
      await this.onInitialize()

  }

  async start () {

    const port = this.get('port')

    this.listener = this.feathers.listen(port)

    await new Promise(resolve => this.listener.once('listening', resolve))

    if (is.func(this.onStart))
      await this.onStart()

    return this.listener
  }

  async end () {

    if (this.listener) {
      await this.listener.close()
      this.listener = null
    }

    if (this.database && this.database.process)
      await new Promise(resolve => {
        this.database.process.once('close', resolve)
        this.database.process.kill()
      })

  }

  // Implementable Client Methods

  // getClientComponent (req, res) {}
  // onSerializeClient (req, res) {}

  // LifeCycle Methods
  // onInitialize () {}
  // onStart () {}

  // Utility Methods

  get (path) {
    const { settings } = this.feathers
    return get.mut(settings, path)
  }

  set (path, value) {
    const { settings } = this.feathers
    return set.mut(settings, path, value)
  }

  log = (strings, ...params) => {

    if (!this.get('logging'))
      return

    const { inspect } = require('util')

    let str = ''
    for (let i = 0; i < strings.length; i++) {
      str += strings[i]
      if (i < params.length)
        str += typeof params[i] === 'string'
          ? params[i]
          : inspect(params[i])
    }

    console.log(str)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default App
