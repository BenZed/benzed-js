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

    let client
    before(() => {
      client = new ClientStore(CONFIG)
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
      const [ FEATHERS ] = Object.getOwnPropertySymbols(client)
      expect(typeof FEATHERS).to.be.equal('symbol')
      const feathers = client[FEATHERS]

      expect(feathers).to.be.instanceof(Object)
      expect(feathers.methods).to.be
        .deep.equal(['find', 'get', 'create', 'update', 'patch', 'remove'])
    })

    it('stores config in client.config', () => {
      expect(client.config).to.be.deep.equal({
        hosts: ['http://localhost:3200'],
        provider: 'rest',
        auth: 'benzed-jwt'
      })
    })

    it('client.config is frozen', () => {
      expect(() => {
        client.config.provider = 'socketio'
      }).to.throw('Cannot assign to read only property')
    })

    it('client.config cannot be changed', () => {
      expect(() => {
        client.config = null
      }).to.throw('Cannot set property config')
    })
  })
})
