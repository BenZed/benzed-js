import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<service/>', () => {

  it('can be created with jsx', () => {
    const app = <service name='users' />

    expect(app[$$entity]).to.have.property('type', 'service')
  })

  describe('entity function', () => {

    it('adds a service to an app', () => {
      const app = (<app/>)()

      expect(app.services).to.not.have.property('users')

      const users = <service name='users' />
      users(app)

      expect(app.services).to.have.property('users')
    })

    it('defaults to feathers-memory if no adapter given', () => {
      const app = (<app>
        <service name='users' />
      </app>)()
      expect(app.services.users).to.have.deep.property('store', { })
    })

    it('applies hooks in _hooksToAdd array', async () => {

      const testHook = () => { testHook.called = true }

      const app = (<app>
        <service name='users' >
          <hooks before all>{testHook}</hooks>
        </service>
      </app>)()

      await app.service('users').find({})

      expect(testHook.called).to.be.equal(true)
    })

    it('handles async mutations', async () => {

      const asyncId = config => {
        return Promise.resolve({
          ...config,
          id: 'identifier'
        })
      }

      const app = await (<app>
        <service name='users'>
          {asyncId}
        </service>
      </app>)()

      expect(app.services.users).to.have.deep.property('store', {})
      expect(app.services.users).to.have.property('id', 'identifier')
    })

    it('throws if not given an app as input')

    it('throws if result cannot be turned into memory service')
  })

})
