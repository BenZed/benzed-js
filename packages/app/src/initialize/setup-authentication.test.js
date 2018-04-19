import { expect } from 'chai'
import setupProviders from './setup-providers'
import setupAuthentication from './setup-authentication'
// import setupServices from './setup-services'
// import setupMiddleware from './setup-middleware'

import App from 'src/app'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

class TestApp extends App {

}

const AUTH_CONFIG = {
  port: 4450,
  auth: true
}

/******************************************************************************/
// Test
/******************************************************************************/

describe('setupAuthentication()', () => {

  it('must be bound to app', () => {
    expect(setupAuthentication).to.throw('Cannot destructure property `feathers` of \'undefined\'')
  })

  describe('authentication', () => {

    let app

    before(() => {
      try {
        app = new TestApp(AUTH_CONFIG)
        app::setupProviders()
        app::setupAuthentication()

      } catch (err) {
        console.log(err)
      }
    })

    describe('sets up auth if defined in config', () => {

      it('adds authentication hooks', () =>
        expect(typeof app.feathers.service('authentication'))
          .to.be.equal('object')
      )

    })

    after(() => app && app.listener && app.end())

  })

})
