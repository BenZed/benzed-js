import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<app/>', () => {

  it('can be created by <app/>', () => {
    const app = <app port={2000} />

    expect(app[$$entity]).to.have.property('type', 'app')
  })

  describe('port prop', () => {

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
      expect(app).to.be.instanceof(Object)

      for (const method of [ 'get', 'set', 'service', 'configure' ])
        expect(app[method]).to.be.instanceof(Function)
    })

    it('adds props to feathers.settings', () => {
      const app = (<app port='2000' />)()

      expect(app.get('port')).to.be.equal(2000)
    })

    it('adds log function', () => {
      const app = (<app/>)()
      expect(app.log).to.be.instanceof(Function)
    })
  })

})
