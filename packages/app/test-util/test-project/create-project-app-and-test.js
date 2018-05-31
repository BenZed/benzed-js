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

  after(async () => {
    if (state.app && state.app.listener) {
      await state.app.onEnd()
      await state.app.end()
    }
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default createProjectAppAndTest
