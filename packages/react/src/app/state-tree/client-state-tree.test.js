import { expect } from 'chai'
import ClientStateTree, { $$feathers } from './client-state-tree'
import { set } from '@benzed/immutable'
import io from 'socket.io-client'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach createTestApi */

/******************************************************************************/
// Data
/******************************************************************************/

const CONFIG = {
  hosts: [ 'http://localhost:3200' ],
  provider: 'rest',
  auth: true
}

/******************************************************************************/
// Helper
/******************************************************************************/

function expectNewClient (config, call = false) {
  const createNewClient = () => new ClientStateTree(config)
  return expect(call ? createNewClient() : createNewClient)
}

/******************************************************************************/
// Tests
/******************************************************************************/

describe.only('Client State Tree', () => {

  let restClient, restClientNoAuth, socketIoClient
  before(() => {
    restClient = new ClientStateTree(CONFIG)
    restClientNoAuth = new ClientStateTree(CONFIG::set('auth', false))
    socketIoClient = new ClientStateTree(CONFIG::set('provider', 'socketio'))
  })

  it('creates an instance of feathers client', () => {

    const feathers = restClient[$$feathers]
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
    }).to.throw('Cannot assign to read only property \'config\'')
  })

  describe('configuration', () => {

    it('is required', () => {
      expectNewClient().to.throw('ClientStore configuration is required.')
    })

    describe('config.hosts', () => {
      it('is required', () => {
        expectNewClient(CONFIG::set('hosts', null))
          .to.throw('hosts is required.')
      })

      it('must be string or an array of strings', () => {
        expectNewClient(CONFIG::set('hosts', {}))
          .to.throw('hosts[0] must be of type: String')
      })

      it('must include http or https protocol', () => {
        expectNewClient(CONFIG::set('hosts', 'localhost:3200'))
          .to.throw('Host must include http(s) protocol.')
      })
    })

    describe('config.provider', () => {
      it('is required', () => [
        expectNewClient(CONFIG::set('provider', null))
          .to.throw('provider is required.')
      ])

      it('must be either rest or socketio', () => {
        expectNewClient(CONFIG::set('provider', 'cake'))
          .to.throw(`provider must be one of: 'rest', 'socketio'`)
      })
    })

    describe('config.auth', () => {
      it('is not required', () => {
        expectNewClient(CONFIG::set('auth', null))
          .to.not.throw('auth is required.')
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

  describe('creates feathers client adapter based on config.provider', () => {

    describe('rest', () => {

      let someService
      before(() => {
        someService = restClient[$$feathers].service('some-service')
      })

      it('has fetch as rest property', () => {
        expect(restClient[$$feathers]).to.have.property('rest', fetch)
      })

      it('retreived services base url comes from client', () => {

        restClient('host').set('nowhere')
        expect(someService).to.have.property('base', 'nowhere/some-service')

        restClient('host').set('somewhere')
        expect(someService).to.have.property('base', 'somewhere/some-service')
      })

      it('retreived services are not instanced every time', () => {
        expect(restClient[$$feathers].service('some-service'))
          .to.be.equal(someService)
      })

    })

    describe('socketio', () => {

      describe('io manager is initialized with specific options', () => {
        it('does not auto connect', () => {
          const feathers = socketIoClient[$$feathers]
          expect(feathers.socket.io.autoConnect).to.be.equal(false)
        })

        it('does not auto reconnect', () => {
          const feathers = socketIoClient[$$feathers]
          expect(feathers.socket.io._reconnection).to.be.equal(false)
        })

        it('500 ms timeout', () => {
          const feathers = socketIoClient[$$feathers]
          expect(feathers.socket.io._timeout).to.be.equal(500)
        })
      })

      describe('uses custom socket io functionality', () => {
        let someService
        before(() => {
          someService = socketIoClient[$$feathers].service('some-service')
        })

        it('has Socket instance as socket property', () => {
          const feathers = socketIoClient[$$feathers]

          expect(feathers).to.have.property('socket')
          expect(feathers.socket).to.be.instanceof(io.Socket)
          expect(feathers.socket.io).to.be.instanceof(io.Manager)
        })

        it('has custom service getter function', () => {
          expect(socketIoClient[$$feathers]).to.have.property('defaultService')
          const defaultService = socketIoClient[$$feathers].defaultService
          expect(defaultService).to.have.property('name', 'bound getSocketIOService')
        })

        it('retreived services are not instanced every time', () => {
          expect(socketIoClient[$$feathers].service('some-service')).to.be.equal(someService)
        })
      })
    })

    describe('auth', () => {

      it('adds passport property', () => {
        expect(restClient[$$feathers]).to.have.property('passport')
        expect(restClientNoAuth[$$feathers]).to.not.have.property('passport')
      })

    })
  })

  for (const provider of [ 'rest', 'socketio' ])
    for (const auth of [ true, false ])
      createTestApi({ [provider]: true, auth }, state => {
        let client
        before(() => {
          client = new ClientStateTree({
            hosts: state.address,
            provider,
            auth
          })
        })
        describe(`usage in a ${provider} non-auth app`, () => {

          describe('connect action', () => {

            let returned
            before(async () => {
              returned = await client.connect()
            })

            it.only('connects to one of the configured available hosts', () => {
              expect(client.host)
                .to.be.equal(state.address)
            })
          })
        })
      })
})
