import { expect } from 'chai'

import last from './last'
import Test from '@benzed/dev'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(last, last => {

  it('returns the last element of an array', () => {
    expect(last([1, 2, 3, 4, 5])).to.be.equal(5)
  })

  it('works on array-likes', () => {
    expect(last('string')).to.be.equal('g')
    expect(last({
      0: 'zero',
      1: 'one',
      length: 2
    })).to.be.equal('one')

    expect(last({
      0: 'zero',
      1: 'one',
      length: 1
    })).to.be.equal('zero')
  })

  it('returns undefined if input is not an array-like', () => {
    expect(last(null)).to.be.equal(undefined)
    expect(last({})).to.be.equal(undefined)
    expect(last({})).to.be.equal(undefined)
  })

})
