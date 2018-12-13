import { expect } from 'chai'

import first from './first'
import Test from '@benzed/dev'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(first, first => {

  it('returns the first element of an array', () => {
    expect(first([1, 2, 3, 4, 5])).to.be.equal(1)
  })

  it('works on array-likes', () => {
    expect(first('string')).to.be.equal('s')
    expect(first({ 0: 'zero', length: 1 })).to.be.equal('zero')
  })

  it('returns undefined if input is not an array-like', () => {
    expect(first(null)).to.be.equal(undefined)
    expect(first({})).to.be.equal(undefined)
    expect(first({})).to.be.equal(undefined)
  })

})
