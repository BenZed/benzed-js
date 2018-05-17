import { expect } from 'chai'
import defaultTo from './default-to'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('defaultTo()', () => {

  it('returns a default value if input is null or undefined', () => {
    expect(defaultTo(false)(null)).to.be.equal(false)
  })

  it('returns value otherwise', () => {
    expect(defaultTo('string')('foo')).to.be.equal('foo')
  })

  describe('config', () => {

    describe('value', () => {
      it('can be any value that isnt null or undefined')
      it('if a function, can be called to retrive value')
      it('if a function, receives validation context')
    })

    describe('call Boolean', () => {
      it('if false and value is function, value will not be called, returning the function itself')
      it('defaults to true')
    })

  })

})
