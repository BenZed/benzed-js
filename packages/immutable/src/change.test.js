import { expect } from 'chai'
import change from './change'

import Test from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(change, change => {

  let data, data2
  before(() => {
    data = {
      foo: 'bar'
    }

    data2 = change(data, data => {
      data.foo = 'cake'
    })
  })

  it('does not change original data', () => {
    expect(data.foo).to.be.equal('bar')
  })

  it('returns copy', () => {
    expect(data2).to.not.be.equal(undefined)
  })

  it('runs mutator on copy', () => {
    expect(data2.foo).to.be.equal('cake')
  })

  it('throws if mutator is not an object', () => {
    expect(() => change({}, null)).to.throw('utator must be a function')
  })

  it('throws if data is not an object', () => {
    for (const badValue of [ Symbol('symbol'), true, false, 'hey', '', () => {}, null, undefined ])
      expect(() => change(badValue, () => {})).to.throw('data must be an object')
  })

})
