import { expect } from 'chai'
import setupProviders from './setup-providers'
import setupAuthentication from './setup-authentication'
// import setupServices from './setup-services'
// import setupMiddleware from './setup-middleware'

import App from 'src/app'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Test
/******************************************************************************/

describe('setupAuthentication()', () => {

  it('must be bound to app', () => {
    expect(setupAuthentication).to.throw('Cannot destructure property `feathers` of \'undefined\'')
  })

  let app, authService

  before(() => {
    try {
      app = new App({ port: 4450, auth: true, rest: true })
      app::setupProviders()
      app::setupAuthentication()
      authService = app.feathers.service('authentication')
    } catch (err) {
      console.error(err)
    }
  })

  describe('if auth is defined', () => {
    it('adds authentication service', () =>
      expect(typeof authService).to.be.equal('object')
    )

    it('adds authentication hooks', () => {
      const beforeHooks = authService.__hooks.before
      expect(beforeHooks.create).to.have.length(1)
      expect(beforeHooks.remove).to.have.length(1)
    })

    it('throws if rest is not enabled', () => {
      const app = new App({ port: 2300, auth: true })
      app::setupProviders()
      expect(() => app::setupAuthentication()).to.throw('cannot be configured on this app. Rest provider is not enabled')
    })
  })

  describe('if auth is not defined', () => {
    it('does nothing', () => {
      const app = new App({ port: 1294 })
      expect(app.feathers.service('authentication')).to.equal(undefined)
    })
  })

  after(() => app && app.listener && app.end())

})
