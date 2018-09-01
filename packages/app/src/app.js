import feathers from '@feathersjs/feathers'
import { get, set } from '@benzed/immutable'
import { milliseconds } from '@benzed/async'

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
  setupChannels,
  connectToDatabase
} from './initialize'

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
    this::setupChannels()
  }

  async start () {

    const port = this.get('port')

    this.listener = this.feathers.listen(port)

    await new Promise(resolve => this.listener.once('listening', resolve))

    return this.listener
  }

  async end () {

    if (this.feathers.io)
      await new Promise(resolve => this.feathers.io.close(resolve))

    if (this.listener) {
      await new Promise(resolve => this.listener.close(resolve))
      this.listener = null
    }

    if (this.database && this.database.client) {
      await new Promise(resolve =>
        this.database.client.close(resolve)
      )
      this.database.link = null
      this.database.client = null
    }

    if (this.database && this.database.process) {
      await new Promise(resolve => {
        this.database.process.once('close', resolve)
        this.database.process.kill()
      })
      this.database.process = null
    }

  }

  // Implementable Hooks

  // getClientComponent (req, res) {}
  // onSerializeClient (req, res) {}

  // LifeCycle Methods

  // Utility Methods

  get (path) {
    return get.mut(this.config, path)
  }

  set (path, value) {
    return set.mut(this.config, path, value)
  }

  get config () {
    return this.feathers.settings
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
