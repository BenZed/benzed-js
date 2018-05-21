// import { expect } from 'chai'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('milliseconds', () => {
  it('is a function')
  it('returns a promise')
  it('resolves after a set number of milliseconds')
})

describe('seconds', () => {
  it('is a function')
  it('returns a promise')
  it('resolves after a set number of milliseconds')
})

describe('until', () => {
  it('is a function')

  describe('config', () => {

    describe('condition function', () => {
      it('casts function to config')
      it('determines when while loop closes')
      it('is required')
    })

    describe('timeout', () => {
      it('maximum time, in milliseconds, while loop can run')
      it('defaults to infinity')
    })

    describe('interval', () => {
      it('condition is checked every <interval> ms')
      it('defaults to 50')
    })

    describe('err', () => {
      it('message to throw in error if while loop times out')
      it('defaults to \'condition could not be met in <timeout> ms\'')
    })
  })

  it('returns number of milliseconds waiting took')
})
