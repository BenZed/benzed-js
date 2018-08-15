import { expect } from 'chai'

import { set } from '@benzed/immutable'

import App from './app'

/******************************************************************************/
// Data
/******************************************************************************/

const CONFIG = {
  port: 4315,
  socketio: true
}

/******************************************************************************/
// Tests
/******************************************************************************/
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('App', () => {

  describe('construction', () => {

    let app

    before(() => {
      try {
        app = new App(CONFIG)
      } catch (err) {
        console.error(err)
      }
    })

    it('is a class', () => {
      expect(App)
        .to
        .throw('cannot be invoked without \'new\'')
    })

    it('creates a feathers object', () => {
      const methods = ['get', 'set', 'service']

      expect(typeof app.feathers).to.be.equal('object')

      for (const method of methods)
        expect(app.feathers[method]).to.be.instanceof(Function)
    })

    it('has a mode property which matches the env.NODE_ENV variable', () => {
      expect(app).to.have.property('mode', process.env.NODE_ENV || 'default')
    })

  })

  describe('initialize()', () => {

    for (const func of [
      'setupProviders',
      'setupAuthentication',
      'setupServices',
      'setupMiddleware',
      'setupChannels'
    ])
      it(`runs ${func}`, () => {

        const str = App.prototype.initialize.toString() // lol
        const includes =
          str.includes(`${func}()`) ||
          str.includes(`${func}.call(`)

        expect(includes).to.equal(true)
      })

  })

  describe('start()', () => {

    it('starts the app listening on the configured port', async () => {

      const app = new App(CONFIG::set('port', v => v + 1))
      expect(app.listener).to.be.equal(null)

      await app.initialize()
      const start = app.start()

      let listening = false
      app.listener.on('listening', () => { listening = true })

      await start
      expect(listening).to.be.equal(true)

      await app.end()
    })

  })

})
