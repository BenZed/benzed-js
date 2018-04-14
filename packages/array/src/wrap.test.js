import { expect } from 'chai'
import { wrap as _wrap, unwrap as _unwrap } from './wrap'

import Test from '@benzed/test'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(_wrap, wrap => {

  it('ensures an input is an array', () => {

    expect(wrap(5)).to.be.instanceof(Array)
    expect(wrap(5)).to.be.deep.equal([5])
  })

  it('returns the input if it is an array', () => {

    const arr = [ 1 ]

    expect(wrap(arr)).to.be.equal(arr)
  })

})

Test.optionallyBindableMethod(_unwrap, unwrap => {

  it('ensures an input is not an array', () => {

    const obj = {}

    expect(unwrap([obj])).to.be.equal(obj)
  })

  it('returns the input if it is not an array', () => {

    const obj = {}

    expect(unwrap(obj)).to.be.equal(obj)
  })

})
