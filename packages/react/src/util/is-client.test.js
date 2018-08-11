import { expect } from 'chai'
import isClient from './is-client'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('isClient', () => {

  it('is a function', () => {
    expect(typeof isClient).to.be.equal('function')
  })

  it('is true if global.window is typeof object', () => {
    expect(isClient()).to.be.equal(typeof window === 'object')
  })

})
