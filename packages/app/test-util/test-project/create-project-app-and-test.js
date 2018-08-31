import TestApp from './test-app'
import testClient from '../test-client'
/* global before after */

/******************************************************************************/
// Main
/******************************************************************************/

function createProjectAppAndTest (setup = {}, tests) {

  const {
    App = TestApp,
    ...override } = setup

  const config = {
    port: 3456,
    logging: false,
    ...override
  }

  const state = {
    app: null,
    client: null
  }

  before(async () => {
    try {
      state.app = new App(config)
      state.address = `http://localhost:${state.app.get('port')}`
      state.client = testClient(state.app)

      await state.app.beforeInitialize(state)
      await state.app.initialize()

      await state.app.beforeStart(state)
      await state.app.start()
      await state.app.afterStart(state)

    } catch (err) {
      console.log('app runtime error', err)
      throw err
    }
  })

  tests(state)

  after(async function () {
    this.timeout(5000)

    if (state.app && state.app.listener)
      await state.app.end()

    if (state.client && state.client.io.connected)
      await new Promise(resolve => {
        state.client.io.once('disconnect', resolve)
        state.client.io.disconnect()
      })

  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default createProjectAppAndTest
