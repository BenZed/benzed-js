import { expect } from 'chai'
import App from '../../src'

const CONFIG_OBJ = { port: 5000 }

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('initialize', () => {
  describe('provider setup', () => {
    describe('socket.io', () => {

      class SocketioMiddlewareApp extends App {
        socketioMiddlewareRan = 0
        socketio (app) {
          this.socketioMiddlewareRan++
        }
      }

      let app
      before(() => {
        app = new SocketioMiddlewareApp(CONFIG_OBJ)
        app.initialize()
        return app.start()
      })

      it('app can be extended with a socketio() function that acts as middleware', () => {
        expect(app.feathers.io.constructor.name).to.be.equal('Server')
        expect(app.socketioMiddlewareRan).to.be.equal(1)
      })

      after(() => app && app.end())

    })

    describe('rest', () => {})

  })

})
