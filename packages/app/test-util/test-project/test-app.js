import App from '../../src/app'

/******************************************************************************/
// Main
/******************************************************************************/

class TestApp extends App {

  start () {
    const promise = super.start()

    setTimeout(() => {
      if (this.listener) {
        console.log('test-app still listening after 1 second. Shutting down.')
        this.end()
      }
    }, 1000)

    return promise
  }

  onInitialize () {}

  beforeStart () {}
  afterStart () {}

  onEnd () {}

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default TestApp
