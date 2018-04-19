import { expect } from 'chai'
import setupProviders from './setup-providers'
import setupAuthentication from './setup-authentication'
import setupServices from './setup-services'

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

describe('setupServices()', () => {

  it('must be bound to app', () => {
    expect(setupServices).to.throw('Cannot destructure property `feathers` of \'undefined\'')
  })

  describe('authentication', () => {

    let app

    before(() => {
      try {
        app = new TestApp(AUTH_CONFIG)
        app::setupProviders()
        app::setupAuthentication()
        app::setupServices()
      } catch (err) {
        console.log(err)
      }
    })

    describe('sets up auth if defined in config', () => {

      it('adds service hooks')

    })

    after(() => app && app.listener && app.end())

  })

})
