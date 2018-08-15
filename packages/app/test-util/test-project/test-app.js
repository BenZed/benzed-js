import App from '../../src/app'
import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

class TestApp extends App {

  start () {
    const promise = super.start()

    setTimeout(() => {
      if (this.listener) {
        console.log('test-app still listening after 10 seconds. Shutting down.')
        this.end()
      }
    }, 10000)

    return is.func(this.onStart)
      ? Promise.resolve(this.onStart())
        .then(() => promise)
      : promise

  }

  initialize () {
    const promise = super.initialize()

    return is.func(this.onInitialize)
      ? Promise
        .resolve(this.onInitialize())
        .then(() => promise)
      : promise
  }

  beforeInitialize () {}

  beforeStart () {}
  afterStart () {}

  onEnd () {}

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default TestApp
