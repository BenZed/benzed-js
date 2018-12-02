import { expect } from 'chai'
import declareEntity from '../../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../../util'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<hooks/>', () => {

  it('can be created with jsx', () => {
    const hooks = <hooks before all />

    expect(hooks[$$entity]).to.have.property('type', 'hooks')

  })

  it('throws if given children')

  describe('config', () => {

    before(() => { })

    it('requires a type prop', () => {
      expect(() => <hooks/>).to.throw('at least one type must be enabled: before, after or error')
    })

    it('requires a method prop', () => {
      expect(() => <hooks before />).to.throw('at least one method must be enabled: all, find, get, patch, update, create or remove')
    })

  })

  describe('entity function', () => {

    const nullHook = ctx => ctx

    it('adds hooks to context._hooksToAdd array', () => {

      const config = { id: 'id', path: '/people' }
      const entity = <hooks after patch>{nullHook}</hooks>

      entity(config)

      expect(config._hooksToAdd).to.be.instanceof(Array)
      expect(config._hooksToAdd).to.be.deep.equal([{
        after: {
          patch: [nullHook]
        }
      }])
    })

    it('throws if not a child of service')
  })
})
