import { expect } from 'chai'
import declareEntity from '../../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../../util'
import { Service as NedbService } from 'feathers-nedb'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<nedb/>', () => {

  it('can be created by <nedb/>', () => {
    const nedb = <nedb />
    expect(nedb[$$entity]).to.have.property('type', 'nedb')
  })

  it('returns a NedbService adapter', () => {
    const nedb = <nedb />
    const service = nedb({ _id: 'id' })
    expect(service).to.be.instanceof(NedbService)
  })

  it('throws if context is not a service config', () => {
    expect(<service name='users'>
      <nedb />
      <nedb />
    </service>).to.throw('cannot apply multiple database adapters to a service')
  })

  it('preserves _hooksToAdd array', () => {

    const hook = ctx => ctx

    const hooks = <hooks before all>{hook}</hooks>
    const nedb = <nedb />

    const config = { id: '_id' }
    hooks(config)

    const service = nedb(config)
    expect(service).to.have.deep.property('_hooksToAdd', [{
      before: { all: [ hook ] }
    }])
  })

  it('throws if it receives children')

})
