import App from '../../src/app'

/******************************************************************************/
// Main
/******************************************************************************/

class TestApp extends App {

  start () {
    const promise = super.start()

    setTimeout(() => {
      if (this.listener) {
        console.log('test-app still listening after 5 seconds. Shutting down.')
        this.end()
      }
    }, 5000)

    return promise
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
