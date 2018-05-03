import { expect } from 'chai'
import number from './number'
import { OPTIONAL_CONFIG } from '../util'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('number()', () => {

  const num = number()

  it('returns if value could not be cast to number', () => {
    expect(
      num(100 * 'x')
    ).to.have.property('message', 'Must be of type: Number')
  })

  it('returns value otherwise', () => {
    expect(
      num(100)
    ).to.be.equal(100)
  })

  it('null and undefined are ignored', () => {

    expect(num(null))
      .to
      .equal(null)

    expect(num(undefined))
      .to
      .equal(undefined)
  })

  describe('takes a config', () => {

    const err = 'That\'s not a number.'

    it('err string', () => {
      const numWithErr = number(err)
      expect(numWithErr(NaN))
        .to.have.property('message', err)
    })

    it('cast function', () => {

      const numWithCast = number({
        cast: value => Number.isNaN(value) ? 0 : value
      })

      expect(numWithCast(NaN))
        .to.be.equal(0)
    })

  })

  it('is optionally configurable', () => {
    expect(number).to.have.property(OPTIONAL_CONFIG)
  })

  describe('default casting', () => {

    it('calls the Number constructor', () => {
      expect(
        num('100')
      ).to.be.equal(100)

      expect(
        num('35 29 109')
      ).to.have.property('message', 'Must be of type: Number')

      const obj = { valueOf () { return 42 } }
      expect(
        num(obj)
      ).to.be.equal(42)

      const obj2 = { valueOf () { return NaN } }
      expect(
        num(obj2)
      ).to.have.property('message', 'Must be of type: Number')
    })

  })

})
