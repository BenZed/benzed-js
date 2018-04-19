import { expect } from 'chai'

import App from './app'

import { CONFIG_OBJ } from 'test/util'

/******************************************************************************/
//
/******************************************************************************/
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('App', () => {

  describe('construction', () => {

    let app

    before(() => {
      try {
        app = new App(CONFIG_OBJ)
      } catch (err) {
        console.error(err)
      }
    })

    it('is a class', () => {
      expect(App).to.throw('cannot be invoked without \'new\'')
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
    it('runs setupProviders')
    it('runs setupAuthentication')
    it('runs setupServices')
    it('runs setupMiddleware')
  })

})
