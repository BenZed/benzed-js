import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { ENTITY } from '../util'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('app entity', () => {

  it('can be created by <app/>', () => {
    const app = <app port={2000} />

    expect(app[ENTITY]).to.have.property('type', 'app')
  })

  describe('port prop', () => {

    it('is required', () => {
      expect(() => <app />).to.throw('app.port is required')
    })

    it('must be a number', () => {
      expect(() => <app port='not-a-number' />).to.throw('app.port must be of type: Number')
    })

    it('must be between 1024 and 65534', () => {
      for (const outOfRange of [ 1023, 65536 ])
        expect(() => <app port={outOfRange} />).to.throw('app.port must be between 1024 and 65535')

      for (const outOfRange of [ 1024, 65534 ])
        expect(() => <app port={outOfRange} />).to.not.throw('app.port must be between 1024 and 65535')
    })

  })

  describe('entity function', () => {

    it('creates a feathers app', () => {
      const app = (<app port='2000' />)()
      expect(app.constructor).to.have.property('name', 'App')
    })

    it('adds props to feathers.settings', () => {
      const app = (<app port='2000' />)()

      expect(app.get('port')).to.be.equal(2000)
    })
  })

})
