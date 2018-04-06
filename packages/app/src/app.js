import { isObject } from './util'
import { ERROR_MESSAGES } from './constants'

/******************************************************************************/
// Bens super duper backend class
/******************************************************************************/

// This is going to be my defacto class for creating backends out of modules I'm
// familiar. It will wrap a feathers app, take a configuration object that determines
// how complex it is. This will make it easier to test, and reduce the amount of
// testing required for projects that depend on this repo.

// The App should be able to serve anything from static sites to complex web apps:
// server-side rendering of a react ui
// user authentication
// socket.io provider
// rest provider
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

  constructor (config) {

    if (!isObject(config))
      throw new Error(ERROR_MESSAGES.RequiresConfigObject)

    this.initialize()
  }

  initialize () {

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default App
