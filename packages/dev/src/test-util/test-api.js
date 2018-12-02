import TestClient from './test-client'

/* global before after */

/******************************************************************************/
// Main
/******************************************************************************/

function TestApi (entity, func) {

  const state = {}

  before(async () => {
    state.api = await entity()
    await state.api.start()

    state.client = new TestClient({
      port: state.api.get('port'),
      auth: !!state.api.get('auth'),
      provider: state.api.io ? 'socketio' : 'rest'
    })

    state.address = `http://localhost:${state.api.get('port')}`

    if (state.client.connect)
      await state.client.connect()
  })

  func(state)

  after(() => state.api?.end())
}
/******************************************************************************/
// Exports
/******************************************************************************/

export default TestApi
