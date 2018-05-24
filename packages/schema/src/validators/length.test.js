import { expect } from 'chai'

import length from './length'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('length()', () => {
  let min5
  before(() => {
    min5 = length('>', 5)
  })

  it('returns an error if value does not have a numeric length', () => {
    expect(min5({ length: 4 })).to.have.property('message', 'length must be greater than 5')
  })

  it('returns value if it does not have length', () => {
    const sym = Symbol('has-no-length')
    expect(min5(sym)).to.equal(sym)
  })

  it('returns value otherwise', () => {
    const string = 'long-enough-string'
    expect(min5(string))
      .to.be.equal(string)
  })

  // Consumes the same configuration as argsToRangeCompare. Maybe I should make
  // a generic test? TODO
  // describe('configuration')

})
