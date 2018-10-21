import { expect } from 'chai'

import { createProjectAppAndTest, TestApp } from 'test-util/test-project'
import { milliseconds } from '@benzed/async'

import setupProviders from './setup-providers'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('setupProviders()', () => {

  it('must be bound to app', () => {
    expect(setupProviders).to.throw('Cannot')
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

      class SocketioMiddlewareApp extends TestApp {

        socketioMiddlewareRan = 0
        testMessagesReceived = 0
        noticesReceived = 0
        runsBound = false

        async afterStart (state) {
          await state.client.connect()
          state.client.noticesReceived = 0
          state.client.io.on('test-notice', () => state.client.noticesReceived++)
          state.client.io.emit('test-message')

          await milliseconds(25)
        }

        setupSocketMiddleware (io) {
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

      createProjectAppAndTest({ App: SocketioMiddlewareApp, socketio: true }, state => {
        it('creates a socket.io server', () => {
          expect(state.app.feathers.io.constructor.name).to.be.equal('Server')
        })

        it('clients can connect with socket.io-client', () => {
          expect(state.client.io.connected).to.be.equal(true)
        })

        it('app can be extended with a socketio() function that acts as middleware',
          () => {
            expect(state.app.socketioMiddlewareRan).to.be.equal(1)
          })

        it('socketio() function runs bound',
          () => {
            expect(state.app.runsBound).to.be.equal(true)
          })

        it('app receives client messages',
          () => {
            expect(state.app.testMessagesReceived).to.be.equal(1)
          })

        it('client receives app messages',
          () => {
            expect(state.client.noticesReceived).to.be.equal(1)
          })
      })
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
