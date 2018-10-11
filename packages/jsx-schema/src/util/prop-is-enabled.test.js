import { expect } from 'chai'

import propIsEnabled from './prop-is-enabled'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('propIsEnabled', () => {

  it('is a function', () => {
    expect(propIsEnabled).to.be.instanceof(Function)
  })

  it('returns false if input is false, null or undefined', () => {
    for (const falsy of [ null, undefined, false ])
      expect(propIsEnabled(falsy)).to.be.equal(false)
  })

  it('returns true otherwise', () => {
    for (const truthy of [ true, {}, [], 0, '' ])
      expect(propIsEnabled(truthy)).to.be.equal(true)
  })

})
