import feathers from '@feathersjs/feathers'
import { get, set } from '@benzed/immutable'

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
// Main
/******************************************************************************/

// The App class itself is an abstractish class that should be extended to
// add services/middleware

class App {

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

  get (path) {
    const { settings } = this.feathers
    return get.mut(settings, path)
  }

  set (path, value) {
    const { settings } = this.feathers
    return set.mut(settings, path, value)
  }

  async initialize () {
    this::setupProviders()
    this::setupAuthentication()
    await this::connectToDatabase()
    this::setupServices()
    this::setupMiddleware()
  }

  async start () {

    const port = this.get('port')
    const listener = this.feathers.listen(port)

    await new Promise(resolve => listener.once('listening', resolve))

    this.listener = listener

    return listener
  }

  end () {
    if (this.listener)
      return this.listener.close()
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default App
