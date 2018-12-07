import TestClient from './test-client'
import is from 'is-explicit'
import getDescriber from './get-describer'

/* global before after */

/******************************************************************************/
// Main
/******************************************************************************/

function TestApi (...args) {

  const [ entity, func ] = args.filter(is.func)
  const [ description ] = args.filter(is.string)
  const [ settings = {} ] = args.filter(is.plainObject)

  const describer = getDescriber(this)

  describer(description || settings.description || 'in a test app', () => {

    const state = {}

    before(async () => {
      state.api = await entity()
      await state.api.start()

      state.client = settings.client !== false
        ? new TestClient({
          port: state.api.get('port'),
          auth: !!state.api.get('auth'),
          provider: state.api.io ? 'socketio' : 'rest',
          ...settings
        })
        : null

      state.address = `http://localhost:${state.api.get('port')}`

      if (state?.client.connect)
        await state.client.connect()
    })

    func(state)

    after(function () {

      this.timeout(8000)

      return state.api?.end()
    })
  })

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default getDescriber.wrap(TestApi)
