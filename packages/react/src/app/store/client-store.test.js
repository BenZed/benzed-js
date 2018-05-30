import { expect } from 'chai'
import ClientStore from './client-store'
import { createProjectAppAndTest } from '@benzed/app/test-util/test-project'
import { set } from '@benzed/immutable'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const CONFIG = {
  hosts: [ 'http://localhost:3200' ],
  provider: 'rest',
  auth: true
}

function expectNewClient (config, call = false) {

  const createNewClient = () => new ClientStore(config)

  return expect(call ? createNewClient() : createNewClient)
}

describe.only('Client Store', () => {

  it('is a class', () => {
    expect(ClientStore).to.throw('invoked without \'new\'')
  })

  describe('construct', () => {

    let restClient, socketIoClient, FEATHERS
    before(() => {
      restClient = new ClientStore(CONFIG)
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
          expectNewClient(CONFIG::set('auth', 'null'))
            .to.not.throw('auth is Required.')
        })
        it('true gets cast to a default token key', () => {
          expectNewClient(CONFIG::set('auth', true), true)
            .to.have.deep.property('config', {
              ...CONFIG,
              auth: 'benzed-jwt'
            })
        })
        it('false gets cast to null', () => {
          expectNewClient(CONFIG::set('auth', false), true)
            .to.have.deep.property('config', {
              ...CONFIG,
              auth: null
            })
        })
        it('must be at least 3 characters', () => {
          expectNewClient(CONFIG::set('auth', 'ab'))
            .to.throw('auth token key must be at least 3 characters long')
        })
        it('value otherwise', () => {
          expectNewClient(CONFIG::set('auth', 'whatever-jwt'), true)
            .to.have.deep.property('config', {
              ...CONFIG,
              auth: 'whatever-jwt'
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
        auth: 'benzed-jwt'
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

      describe('if rest, uses custom setupRest functionality', () => {

        let someService
        before(() => {
          someService = restClient.service('some-service')
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
          expect(restClient.service('some-service')).to.be.equal(someService)
        })

      })

      describe('socketio', () => {

        // it('uses socket io functionality', () => {
        //   console.log(socketIoClient[FEATHERS])
        // })

      })

    })

  })
})
