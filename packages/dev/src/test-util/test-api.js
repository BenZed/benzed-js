import TestClient from './test-client'
import is from 'is-explicit'

/* global before after */

/******************************************************************************/
// Main
/******************************************************************************/

function TestApi (entity, settings, func) {

  if (is.func(settings)) {
    func = settings
    settings = {}
  }

  const state = {}

  before(async () => {
    state.api = await entity()
    await state.api.start()

    state.client = settings && new TestClient({
      port: state.api.get('port'),
      auth: !!state.api.get('auth'),
      provider: state.api.io ? 'socketio' : 'rest',
      ...settings
    })

    state.address = `http://localhost:${state.api.get('port')}`

    if (state?.client.connect)
      await state.client.connect()
  })

  func(state)

  after(function () {

    this.timeout(8000)

    return state.api?.end()
  })
}
/******************************************************************************/
// Exports
/******************************************************************************/

export default TestApi
