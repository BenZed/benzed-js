import { expect } from 'chai'
import compileHooks, { HOOKS, validateHookTypeStructure } from './compile-hooks'

import App from 'src/app'
import Service from './service'

/******************************************************************************/
// Helper
/******************************************************************************/

// Service constructor does not return an instance of service, so we have
// to fake it.

const createDummyService = () => Object({

  addHooks () {},

  [HOOKS]: validateHookTypeStructure({}),

  before: Service.prototype.before,
  after: Service.prototype.after,
  error: Service.prototype.error
})

/******************************************************************************/
// Tests
/******************************************************************************/

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('compileHooks()', () => {

  it('is a function', () => {
    expect(compileHooks)
      .to.be
      .instanceof(Function)
  })

  let app

  before(() => {
    app = new App({
      port: 4125,
      socketio: true
    })

  })

  describe('returns hook object', () => {
    it('returns a object with feathers hook structure', () => {

      const dummyService = createDummyService()

      const hooks = dummyService::compileHooks(app, { })

      expect(hooks).to.be.instanceof(Object)

      // No configuration, no hooks added
      expect(Object.keys(hooks)).to.have.length(0)
    })
    it('prunes object structure to only include entries with hook')
  })

  describe('adds shortcut hooks via app or service config', () => {

    describe('soft-delete', () => {
      it('app.config[serviceName].softDelete', () => {
        const dummyService = createDummyService()

        const hooks = dummyService::compileHooks(
          app,
          { softDelete: {} }
        )

        expect(hooks.before.all).to.have.length(1)
      })
    })

    describe('auth', () => {
      it('app.config.auth and app.config[serviceName].auth', () => {
        app.set('auth', { })
        const dummyService = createDummyService()

        const hooks = dummyService::compileHooks(
          app,
          { auth: true }
        )

        delete app.feathers.settings.auth

        expect(hooks.before.all).to.have.length(1)
      })
    })

    it('ordered according to priority', () => {
      app.set('auth', { })
      const dummyService = createDummyService()

      const hooks = dummyService::compileHooks(
        app,
        {
          auth: true,
          softDelete: {}
        }
      )

      delete app.feathers.settings.auth

      expect(hooks.before.all).to.have.length(2)
      expect(hooks.before.all[0]).to.have.property('name', 'jwt-auth')
      expect(hooks.before.all[1]).to.have.property('name', 'soft-delete')
    })

  })

  describe('adds service hooks', () => {
    it('validates correct hook structure')
    it('inlines hooks with existing hooks, respecting priority')
    it('preserves order of equal priority hooks')
  })

})