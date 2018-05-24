import { expect } from 'chai'
import string from './string'
import { OPTIONAL_CONFIG } from '../util/symbols'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('string()', () => {

  let str
  before(() => {
    str = string()
  })

  it('returns if value could not be cast to string', () => {
    expect(
      str(Symbol('not-a-string'))
    ).to.have.property('message', 'Must be of type: String')
  })

  it('null and undefined are ignored', () => {

    expect(str(null))
      .to
      .equal(null)

    expect(str(undefined))
      .to
      .equal(undefined)
  })

  describe('takes a config', () => {

    const err = 'That\'s not a string.'

    it('err string', () => {
      const strWithErr = string(err)
      expect(strWithErr(Symbol('still-not-a-string')))
        .to.have.property('message', err)
    })

    it('cast function', () => {
      const strWithCast = string(value => String(value))
      expect(strWithCast({ toString () { return 'a-string' } }))
        .to.be.equal('a-string')
    })

  })

  it('is optionally configurable', () => {
    expect(string).to.have.property(OPTIONAL_CONFIG)
  })

  describe('default casting', () => {

    it('casts number or bool to string', () => {
      expect(
        str(true)
      ).to.be.equal('true')
      expect(
        str(100)
      ).to.be.equal('100')
    })

    it('calls toString on Object, provided it is not the Object.prototype.toString default', () => {

      expect(
        str([0, 1, 2])
      ).to.be.equal('0,1,2')

      expect(
        str({})
      ).to.have.property('message', 'Must be of type: String')

    })

    it('only calls toString if its a function', () => {

      const obj = { toString: false }
      expect(
        str(obj)
      ).to.have.property('message', 'Must be of type: String')

    })

  })

})
