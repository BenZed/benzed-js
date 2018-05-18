import { expect } from 'chai'

import setupServices from './setup-services'

import App from 'src/app'
import Service from 'src/services/service'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Test
/******************************************************************************/

describe('setupServices()', () => {

  class MessageApp extends App {
    services = {
      messages: (config, name, app) => {
        app.messagesSetup = true
      }
    }
  }

  it('must be bound to app', () => {
    expect(setupServices).to.throw('Cannot destructure property `feathers` of \'undefined\'')
  })

  describe('app.services', () => {

    it('are used instead of standard Service constructor', () => {

      const msgApp = new MessageApp({
        port: 3200,
        auth: false,
        socketio: true,
        services: {
          messages: true
        }
      })

      expect(msgApp::setupServices).to.not.throw(Error)
      expect(msgApp.messagesSetup).to.be.equal(true)

    })

    it('uses extended Service constructors', () => {

      class CustomService extends Service {
        constructor (config, name, app) {
          super(config, name, app)
          app.customServiceSetup = true
        }
      }

      class CustomApp extends App {
        services = {
          custom: CustomService
        }
      }

      const customApp = new CustomApp({
        port: 3200,
        auth: false,
        socketio: true,
        services: {
          custom: true
        }
      })

      expect(customApp::setupServices).to.not.throw(Error)
      expect(customApp.customServiceSetup).to.equal(true)

    })

    it('throws if config.service[serviceName] counterpart is missing', () => {

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
