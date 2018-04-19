import { expect } from 'chai'
import App from 'src'
import { testClient, CONFIG_OBJ } from 'test/util'
import { copy } from '@benzed/immutable'
import { milliseconds } from '@benzed/async'
import setupProviders from './setup-providers'

const RT_CONFIG = CONFIG_OBJ::copy()
delete RT_CONFIG.ui

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('setupProviders()', () => {

  it('must be bound to app', () => {
    expect(setupProviders).to.throw('Cannot destructure property `feathers` of \'undefined\'')
  })

  it('is only export', () => {
    const supexports = require('./setup-providers')
    expect(Object.keys(supexports)).to.have.length(1)
    expect(supexports.default).to.equal(setupProviders)
  })

  describe('sets up socket.io', () => {

    class SocketioMiddlewareApp extends App {
      socketioMiddlewareRan = 0
      testMessagesReceived = 0
      noticesReceived = 0
      socketio (io) {
        io.use((socket, next) => {
          this.socketioMiddlewareRan++
          socket.on('test-message', () => {
            this.testMessagesReceived++
            socket.emit('test-notice')
          })
          next()
        })
      }
    }

    let app, client
    before(async () => {
      try {
        app = new SocketioMiddlewareApp(RT_CONFIG)
        app::setupProviders()
        await app.start()

        client = testClient(app)
        await client.connect()
        client.io.emit('test-message')
        client.io.on('test-notice', () => app.noticesReceived++)

        await milliseconds(5)

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

    it('app receives client messages',
      () => {
        expect(app.testMessagesReceived).to.be.equal(1)
      })

    it('client receives app messages',
      () => {
        expect(app.noticesReceived).to.be.equal(1)
      })

    after(() => app && app.end())

  })

  describe('rest', () => {

  })

})
