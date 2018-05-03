import { expect } from 'chai'

import typeOf from './type-of'
import bool from './bool'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('typeOf()', () => {

  function Foo () {}

  const foo = typeOf(Foo)

  it('returns error if input is not of specified type', () => {
    expect(foo('not-foo'))
      .to
      .have
      .property('message', `Must be of type: Foo`)
  })

  it('returns the value, otherwise', () => {
    const value = new Foo()

    expect(foo(value))
      .to
      .equal(value)
  })

  it('null and undefined are ignored', () => {

    expect(foo(null))
      .to
      .equal(null)

    expect(foo(undefined))
      .to
      .equal(undefined)
  })

  describe('takes a configuration', () => {

    const err = 'See, effectively, what you\'ve done is fuck up.'

    it('err string', () => {
      const fooWithErr = typeOf(Foo, err)
      expect(fooWithErr({ }))
        .to.have.property('message', err)
    })

    it('cast function', () => {
      const fooWithCast = typeOf({ type: Foo, cast: value => new Foo() })
      expect(fooWithCast(true))
        .to.be.instanceof(Foo)
    })

  })

  describe('can compose other type functions', () => {

    it('type functions can be used as types', () => {

      const nestedBool = typeOf(bool)

      expect(nestedBool(true))
        .to.be.equal(true)

    })

  })

})
