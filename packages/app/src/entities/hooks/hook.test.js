import { expect } from 'chai'
import declareEntity from '../../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../../util'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<hook/>', () => {

  it('can be created with jsx', () => {
    const hook = <hook func={() => {}} />

    expect(hook[$$entity]).to.have.property('type', 'hook')

  })

  it('requires a func', () => {
    expect(() => <hook/>).to.throw('must have func prop or function child set.')
  })

})
