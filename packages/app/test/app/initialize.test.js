import { expect } from 'chai'
import App from '../../src'
import { testClient, CONFIG_OBJ } from '../util'
import { copy } from '@benzed/immutable'

const RT_CONFIG = CONFIG_OBJ::copy()
delete RT_CONFIG.ui

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('initialize', () => {
  describe('provider setup', () => {
    describe('socket.io', () => {

      class SocketioMiddlewareApp extends App {
        socketioMiddlewareRan = 0
        socketio (io) {
          io.use((socket, next) => {
            this.socketioMiddlewareRan++
            next()
          })
        }
      }

      let app, client
      before(async () => {
        app = new SocketioMiddlewareApp(RT_CONFIG)
        app.initialize()
        try {
          await app.start()
          client = testClient(app)
          await client.connect()
        } catch (err) {
          console.log(err)
          throw err
        }
      })

      it('creates a socket.io server', () => {
        expect(app.feathers.io.constructor.name).to.be.equal('Server')
      })

      it('clients can connect with socket.io-client', () => {
        expect(client.io.connected).to.be.equal(true)
      })

      it('app can be extended with a socketio() function that acts as middleware',
        () => {
          expect(app.socketioMiddlewareRan).to.be.equal(1)
        })

      after(() => app && app.end())

    })

  })

})
