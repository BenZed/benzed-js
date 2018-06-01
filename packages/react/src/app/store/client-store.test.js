import { expect } from 'chai'
import ClientStore from './client-store'
import { createProjectAppAndTest } from '@benzed/app/test-util/test-project'
import { set } from '@benzed/immutable'

import io from 'socket.io-client'
import path from 'path'
import fs from 'fs-extra'

import { expectReject, expectResolve } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Data
/******************************************************************************/

const EMAIL = 'test@email.com'
const PASS = 'test-password'

/******************************************************************************/
// Data
/******************************************************************************/

const CONFIG = {
  hosts: [ 'http://localhost:3200' ],
  provider: 'rest',
  auth: true
}

const DB_PATH = path.resolve(__dirname, '../../../temp/client-store-test-db')

// Empty DB Path
fs.ensureDirSync(DB_PATH)
fs.removeSync(DB_PATH)
fs.ensureDirSync(DB_PATH)

/******************************************************************************/
// Helper
/******************************************************************************/

function expectNewClient (config, call = false) {
  const createNewClient = () => new ClientStore(config)
  return expect(call ? createNewClient() : createNewClient)
}

/******************************************************************************/
// Tests
/******************************************************************************/

describe('Client Store', () => {

  it('is a class', () => {
    expect(ClientStore).to.throw('invoked without \'new\'')
  })

  describe('construct', () => {

    let restClient, restClientNoAuth, socketIoClient, FEATHERS
    before(() => {
      restClient = new ClientStore(CONFIG)
      restClientNoAuth = new ClientStore(CONFIG::set('auth', false))
      socketIoClient = new ClientStore(CONFIG::set('provider', 'socketio'))
      FEATHERS = Object
        .getOwnPropertySymbols(restClient)
        .filter(sym => String(sym).includes('feathers-client-instance'))[0]
    })

    describe('configuration', () => {

      it('is required', () => {
        expectNewClient().to.throw('ClientStore configuration is required.')
      })

      describe('config.hosts', () => {
        it('is required', () => {
          expectNewClient(CONFIG::set('hosts', null))
            .to.throw('hosts is Required.')
        })

        it('must be string or an array of strings', () => {
          expectNewClient(CONFIG::set('hosts', {}))
            .to.throw('hosts Must be an Array of String')
        })
      })

      describe('config.provider', () => {
        it('is required', () => [
          expectNewClient(CONFIG::set('provider', null))
            .to.throw('provider is Required.')
        ])

        it('must be either rest or socketio', () => {
          expectNewClient(CONFIG::set('provider', 'cake'))
            .to.throw('provider Must be one of: rest, socketio')
        })
      })

      describe('config.auth', () => {
        it('is not required', () => {
          expectNewClient(CONFIG::set('auth', null))
            .to.not.throw('auth is Required.')
        })
        it('true gets cast to a default auth options object', () => {
          expectNewClient(CONFIG::set('auth', true), true)
            .to.have.deep.property('config', {
              ...CONFIG,
              auth: {
                storageKey: 'benzed-jwt',
                cookie: 'benzed-jwt'
              }
            })
        })
        it('false gets cast to null', () => {
          expectNewClient(CONFIG::set('auth', false), true)
            .to.have.deep.property('config', {
              ...CONFIG,
              auth: null
            })
        })

        it('strings get cast to tokenKeys', () => {
          expectNewClient(CONFIG::set('auth', 'whatever-jwt'), true)
            .to.have.deep.property('config', {
              ...CONFIG,
              auth: {
                storageKey: 'whatever-jwt',
                cookie: 'whatever-jwt'
              }
            })
        })
      })
    })

    it('creates an instance of feathers client', () => {

      const feathers = restClient[FEATHERS]
      expect(feathers)
        .to.be.instanceof(Object)

      expect(feathers.methods)
        .to.be
        .deep.equal(['find', 'get', 'create', 'update', 'patch', 'remove'])
    })

    it('stores config in client.config', () => {
      expect(restClient.config).to.be.deep.equal({
        hosts: ['http://localhost:3200'],
        provider: 'rest',
        auth: {
          storageKey: 'benzed-jwt',
          cookie: 'benzed-jwt'
        }
      })
    })

    it('client.config is frozen', () => {
      expect(() => {
        restClient.config.provider = 'socketio'
      }).to.throw('Cannot assign to read only property')
    })

    it('client.config cannot be changed', () => {
      expect(() => {
        restClient.config = null
      }).to.throw('Cannot set property config')
    })

    describe('creates feathers client adapter based on config.provider', () => {

      describe('rest', () => {

        let someService
        before(() => {
          someService = restClient[FEATHERS].service('some-service')
        })

        it('has fetch as rest property', () => {
          expect(restClient[FEATHERS]).to.have.property('rest', fetch)
        })

        it('has custom service getter function', () => {
          expect(restClient[FEATHERS]).to.have.property('defaultService')
          const defaultService = restClient[FEATHERS].defaultService
          expect(defaultService).to.have.property('name', 'bound getClientStoreFetchService')
        })

        it('retreived services base url comes from client', () => {
          restClient.set('host', 'nowhere')
          expect(someService).to.have.property('base', 'nowhere/some-service')

          restClient.set('host', 'somewhere')
          expect(someService).to.have.property('base', 'somewhere/some-service')
        })

        it('retreived services are not instanced every time', () => {
          expect(restClient[FEATHERS].service('some-service')).to.be.equal(someService)
        })

      })

      describe('socketio', () => {

        describe('io manager is initialized with specific options', () => {
          it('does not auto connect', () => {
            const feathers = socketIoClient[FEATHERS]
            expect(feathers.socket.io.autoConnect).to.be.equal(false)
          })

          it('does not auto reconnect', () => {
            const feathers = socketIoClient[FEATHERS]
            expect(feathers.socket.io._reconnection).to.be.equal(false)
          })

          it('500 ms timeout', () => {
            const feathers = socketIoClient[FEATHERS]
            expect(feathers.socket.io._timeout).to.be.equal(500)
          })
        })

        describe('uses custom socket io functionality', () => {
          let someService
          before(() => {
            someService = socketIoClient[FEATHERS].service('some-service')
          })

          it('has Socket instance as socket property', () => {
            const feathers = socketIoClient[FEATHERS]

            expect(feathers).to.have.property('socket')
            expect(feathers.socket).to.be.instanceof(io.Socket)
            expect(feathers.socket.io).to.be.instanceof(io.Manager)
          })

          it('has custom service getter function', () => {
            expect(socketIoClient[FEATHERS]).to.have.property('defaultService')
            const defaultService = socketIoClient[FEATHERS].defaultService
            expect(defaultService).to.have.property('name', 'bound getClientStoreSocketIOService')
          })

          it('retreived services are not instanced every time', () => {
            expect(socketIoClient[FEATHERS].service('some-service')).to.be.equal(someService)
          })
        })

      })

      describe('auth', () => {

        it('adds passport property', () => {
          expect(restClient[FEATHERS]).to.have.property('passport')
          expect(restClientNoAuth[FEATHERS]).to.not.have.property('passport')
        })

        it('.auth state property is now an object', () => {
          expect(restClient.auth).to.be.deep.equal({
            userId: null,
            error: null
          })
        })

      })
    })
  })

  const PORT = 6800
  const BAD_PORT = 9781
  const config = CONFIG
    ::set('hosts', [
      'http://localhost:' + BAD_PORT,
      'http://localhost:' + PORT
    ])

  describe('rest usage', () => {

    let rest, FEATHERS
    before(() => {
      rest = new ClientStore(config)
      FEATHERS = Object
        .getOwnPropertySymbols(rest)
        .filter(sym => String(sym).includes('feathers-client-instance'))[0]
    })

    createProjectAppAndTest({
      services: {
        articles: true
      },
      port: PORT,
      rest: true,
      logging: false
    }, state => {

      beforeEach(async () => {
        await state.app.articles.remove(null)
      })

      it('throws if host has not been resolved', () => {
        return rest[FEATHERS].service('articles')
          .find({})
          ::expectReject('host has not been resolved')
      })

      describe('connect', () => {
        it('returns host connected to', async () => {
          const host = await rest.connect()
          expect(host).to.be.equal(rest.host)
          expect(host).to.be.equal(config.hosts[1])
        })

        it('services use connected host', async () => {

          await rest.connect()
          const articles = rest[FEATHERS].service('articles')

          await articles.create([
            { body: 'first article!' },
            { body: 'second article!' }
          ])::expectResolve()

          const docs = await articles.find({})

          expect(docs).to.have.length(2)
        })
      })
    })
  })

  describe('socketio usage', () => {

    let socketio, FEATHERS
    before(() => {
      socketio = new ClientStore(config::set('provider', 'socketio'))
      FEATHERS = Object
        .getOwnPropertySymbols(socketio)
        .filter(sym => String(sym).includes('feathers-client-instance'))[0]
    })

    createProjectAppAndTest({
      services: {
        articles: true
      },
      port: PORT,
      socketio: true,
      logging: false
    }, state => {

      beforeEach(async () => {
        await state.app.articles.remove(null)
      })

      it('throws if host is not connected', () => {
        return socketio[FEATHERS].service('articles').find({})
          ::expectReject('not connected to host')
      })

      describe('connect', () => {

        it('returns host connected to', async function () {
          this.slow(10000)
          this.timeout(10000)

          const host = await socketio.connect()

          expect(host).to.be.equal(socketio.host)
          expect(host).to.be.equal(config.hosts[1])
        })

        it('services use connected host', async () => {

          await socketio.connect()
          const articles = socketio[FEATHERS].service('articles')

          await articles.create([
            { body: 'first article!' },
            { body: 'second article!' }
          ])::expectResolve()

          const docs = await articles.find({})

          expect(docs).to.have.length(2)
        })
      })
    })
  })

  describe('auth usage', () => {

    let rest, FEATHERS
    before(() => {
      rest = new ClientStore(
        config::set('auth', true)
      )

      FEATHERS = Object
        .getOwnPropertySymbols(rest)
        .filter(sym => String(sym).includes('feathers-client-instance'))[0]
    })

    createProjectAppAndTest({
      services: {
        users: true,
        articles: true
      },
      mongodb: {
        database: 'rest-client-auth-test',
        dbpath: DB_PATH,
        hosts: [ 'localhost:' + (PORT + 100) ]
      },
      port: PORT,
      rest: true,
      logging: false,
      auth: {
        secret: 'deterministic'
      }
    }, state => {

      beforeEach(async () => {

        await state.app.articles.remove(null)
        const users = await state.app.users.find({})
        if (!users.some(user => user.email === EMAIL))
          await state.app.users.create({
            email: EMAIL,
            password: PASS,
            passwordConfirm: PASS
          })

        if (!rest.host)
          await rest.connect()

        if (!rest.auth.userId) {
          rest.auth.error = 'This should be removed.'
          await rest.login(EMAIL, PASS)
        }

      })

      describe('login', () => {

        it('returns logged in userId', async () => {
          const userId = await rest.login(EMAIL, PASS)
          expect(userId).to.be.equal(rest.auth.userId)
        })

        it('populates auth.userId if auth successful', async () => {
          const users = await state.app.users.find({})
          const [ user ] = users.filter(u => u.email === EMAIL)

          expect(rest.auth).to.have.property('userId', `${user._id}`)
        })

        it('clears auth.error if auth successful', () => {
          expect(rest.auth).to.have.property('error', null)
        })

        it('places auth token in storage', () => {
          // This doesn't need to be tested, I'm just being thorough
          const feathers = rest[FEATHERS]
          expect(feathers.settings.accessToken).to.not.be.equal(null)
          expect(feathers.settings.accessToken).to.not.be.equal(undefined)
          expect(feathers.settings.accessToken).to.be.equal(feathers.settings.storage.store['benzed-jwt'])
        })

        it('populates auth.error if auth failed', async () => {
          await rest.login(EMAIL, PASS.repeat(2))
          expect(rest.auth).to.have.property('error', 'Invalid login')
        })

        it('throws if host not resolved', () => {
          rest.host = null
          expect(::rest.login).to.throw('host has not been resolved')
        })

        it('throws if auth is not configured', () => {
          const restClientWithoutAuth = new ClientStore(CONFIG::set('auth', false))

          expect(::restClientWithoutAuth.login).to.throw('Cannot login, auth is not enabled')
        })

        it('first logs out if user is logged in', async () => {
          await rest.login(EMAIL, PASS.repeat(2))
          expect(rest.auth).to.have.property('error', 'Invalid login')
          expect(rest.auth).to.have.property('userId', null)

          const feathers = rest[FEATHERS]

          // If user isn't logged out before logging in, and the subsequent
          // login fails, the token will remain remain from last successful login
          expect(feathers.settings.accessToken).to.be.equal(null)
        })

      })

      describe('logout', () => {
        it('depopulates auth.userId and auth.error', async () => {

          expect(rest.auth.userId).to.not.equal(null)
          rest.auth.error = 'Log me out.'

          await rest.logout()

          expect(rest.auth.userId).to.equal(null)
          expect(rest.auth.error).to.equal(null)
        })
        it('removes auth token from local storage', async () => {

          const feathers = rest[FEATHERS]
          expect(feathers.settings.accessToken).to.not.equal(null)

          await rest.logout()
          expect(feathers.settings.accessToken).to.be.equal(null)
        })
        it('throws if auth is not configured', () => {

          const restClientWithoutAuth = new ClientStore(CONFIG::set('auth', false))
          expect(::restClientWithoutAuth.logout).to.throw('Cannot logout, auth is not enabled')
        })
        it('throws if host is not resolved', () => {
          rest.host = null
          expect(::rest.logout).to.throw('Cannot logout, host has not been resolved')
        })
      })
    })
  })
})
