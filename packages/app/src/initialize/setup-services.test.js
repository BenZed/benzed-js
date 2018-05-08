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

  describe('if app.services is a function', () => {

    class ServiceApp extends App {
      servicesSetup = false
      services (feathers) {
        if (feathers !== this.feathers)
          throw new Error('didnt call with feathers object')
        this.servicesSetup = true
      }
    }

    it('calls app.services with the feathers object', () => {

      const app = new ServiceApp({ port: 1234, socketio: true })

      expect(() => app::setupServices()).to.not.throw('didnt call with feathers object')
      expect(app.servicesSetup).to.equal(true)
    })

  })

  describe('if app.services is an array', () => {

    let app

    function service (feathers) {
      if (this !== app)
        throw new Error('[this] is not scoped to app')

      if (this.feathers !== feathers)
        throw new Error('feathers not passed in as argument')

      this.servicesSetup++
    }

    class ServiceApp extends App {
      servicesSetup = 0
      services = [
        service,
        service
      ]
    }

    it('calls each property with feathers object', () => {

      app = new ServiceApp({ port: 5421, socketio: true })
      expect(() => app::setupServices()).to.not.throw(Error)
      expect(app.servicesSetup).to.equal(2)
    })
  })

  describe('if auth is configured', () => {

    it('sets up a users service if one isn\'t configured', () => {
      const app = new App({ port: 1283, auth: true, socketio: true })
      app::setupServices()
      expect(typeof app.feathers.service('users')).to.be.equal('object')
    })

    it('even if auth.service is somethign other than \'users\'', () => {
      const app = new App({ port: 4910, auth: { service: 'players' }, socketio: true })
      app::setupServices()
      expect(typeof app.feathers.service('players')).to.be.equal('object')
    })
  })

  describe('setting up services with service utility', () => {

    // class MessageApp extends App {
    //
    //   services = {
    //     messages: new Service(),
    //     authors: new Service()
    //   }
    //
    // }

    // const app = new MessageApp({
    //   port: 1234,
    //   auth: {
    //     service: 'authors',
    //     entity: 'author'
    //   }
    // })

    it('dunno how this works yet')

  })

})
