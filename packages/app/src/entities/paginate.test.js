import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'

import { validateOptions } from './paginate'
// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<paginate/>', () => {

  it('can be created with jsx', () => {
    const app = <paginate default={10} max={100} />

    expect(app[$$entity]).to.have.property('type', 'paginate')
  })

  it('throws if given children')

  describe('config', () => {

    let _default, max
    before(() => {

      const { children } = validateOptions.props

      _default = children
        .filter(child => child.key === 'default')[0]

      max = children
        .filter(child => child.key === 'max')[0]
    })

    it('config.default is required', () => {
      expect(!!_default.props.required).to.not.be.equal(false)
    })

    it('config.default must be above zero', () => {
      const { value, operator } = _default.props.range
      expect({ value, operator }).to.be.deep.equal({ operator: '>', value: 0 })
    })

    it('config.max must be above zero', () => {
      const { value, operator } = max.props.range
      expect({ value, operator }).to.be.deep.equal({ operator: '>', value: 0 })
    })

    it('config.max defaults to config.default', () => {
      expect(validateOptions({ default: 5 }))
        .to.have.property('max', 5)
    })
  })

  describe('entity function', () => {

    it('adds pagination to a service config', () => {
      const app = (<app>
        <service name='users'>
          <paginate default={10} max={100} />
        </service>
      </app>)()

      expect(app.services.users.options).to
        .have.deep.property('paginate', { default: 10, max: 100 })
    })

    it('order irrelevent', () => {
      const app = (<app>
        <service name='articles'>
          <nedb />
          <paginate default={10} max={100} />
        </service>
      </app>)()

      expect(app.services.articles.options).to
        .have.deep.property('paginate', { default: 10, max: 100 })
    })

    it('throws if given children')
  })

})
