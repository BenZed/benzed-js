import { expect } from 'chai'
import App from 'src'
import { testClient, CONFIG_OBJ } from 'test/util'
import { copy, set } from '@benzed/immutable'
import { milliseconds } from '@benzed/async'
import setupProviders from './setup-providers'

const RT_CONFIG = CONFIG_OBJ::copy()
delete RT_CONFIG.rest

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

  describe('socket.io', () => {

    describe('will be set up if', () => {
      it('config.socketio is an object, in which case it will be used as options')
      it('will use class defined middleware')
    })

    describe('will not be set up if', () => {
      it('config.socketio is falsy')
    })

    describe('setup', () => {

      class SocketioMiddlewareApp extends App {

        socketioMiddlewareRan = 0
        testMessagesReceived = 0
        noticesReceived = 0
        runsBound = false

        socketio (io) {
          if (this && 'runsBound' in this)
            this.runsBound = true

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
          app = new SocketioMiddlewareApp(RT_CONFIG::set('socketio', true))
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

      it('socketio() function runs bound',
        () => {
          expect(app.runsBound).to.be.equal(true)
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
  })

  describe('sets up rest', () => {

    describe('will be set up if', () => {
      it('config.rest is true')
    })

    describe('will not be set up if', () => {
      it('config.rest is false')
    })

  })

})
