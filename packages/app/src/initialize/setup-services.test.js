import { expect } from 'chai'

import setupServices from './setup-services'

import App from 'src/app'
// import Service from 'src/services'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Test
/******************************************************************************/

describe('setupServices()', () => {

  it('must be bound to app', () => {
    expect(setupServices).to.throw('Cannot destructure property `feathers` of \'undefined\'')
  })

  describe('app.services', () => {
    it('are used instead of standard Service constructor')
    it('throws if config.service[serviceName] counterpart is missing', () => {
      class MessageApp extends App {
        services = {
          messages: () => {
            console.log('this is where a message service would go')
          }
        }
      }

      const msgApp = new MessageApp({
        port: 3200,
        auth: false,
        socketio: true
      })

      expect(msgApp::setupServices).to.throw('missing configuration for \'messages\' service')
    })

    it('are not setup if config.service[serviceName] is disabled', () => {

      const app = new App({
        socketio: true,
        port: 4500,
        services: {
          articles: false
        }
      })

      app::setupServices()
      expect(app.feathers.service('articles')).to.be.equal(undefined)

      const app2 = new App({
        socketio: true,
        port: 4500,
        services: {
          articles: true
        }
      })

      app2::setupServices()
      expect(app2.feathers.service('articles')).to.be.instanceof(Object)

    })

    describe('auth users service', () => {
      it('uses UserService constructor instead of generic if no counterpart exists in app.services')
      it('uses app.services[userServiceName] otherwise')
    })

    describe('files service', () => {
      it('uses FileService constructor instead of generic if no counterpart exists in app.services')
      it('uses app.services.files otherwise')
    })

  })
})
