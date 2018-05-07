import { expect } from 'chai'
import any from './any'
import { Context, OPTIONAL_CONFIG } from '../util'
import bool from './bool'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('any()', () => {

  it('returns value', () => {
    expect(any()('100')).to.equal('100')
  })

  describe('Takes a configs', () => {

    it('validator functions', () => {
      const anyBool = any(bool)
      expect(anyBool(true)).to.be.equal(true)
      expect(anyBool('1234', new Context().safe())).to.have.property('message', 'Must be of type: Boolean')
    })

  })

  it('is optionally configurable', () => {
    expect(any).to.have.property(OPTIONAL_CONFIG)
  })

})
