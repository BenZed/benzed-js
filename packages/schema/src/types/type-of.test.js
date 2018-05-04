import { expect } from 'chai'

import typeOf from './type-of'
import bool from './bool'

import { Context } from '../util'

import { expectResolve, expectReject } from '@benzed/dev'

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

    it('type validator or type constructor', () => {

      const string = typeOf(String)
      expect(string('wee'))
        .to.equal('wee')

    })

    it('sub validators', () => {

      const short = value => value == null || value.length <= 3
        ? value
        : new Error('Too long!')

      const lower = value => value != null
        ? value.toLowerCase()
        : value

      const shortString = typeOf(String, short, lower)

      expect(shortString('ANT')).to.be.equal('ant')

      expect(() => shortString('FAIL', new Context())).to.throw('Too long!')

    })

    it('sub validators can be asyncronous', async () => {

      const delay = value => Promise.resolve(value)
      const error = value => Promise.reject(new Error('Seriously what is your problem'))

      const delayString = typeOf(String, delay)
      await delayString('foobar')::expectResolve(ers => ers.to.equal('foobar'))

      const errString = typeOf(String, delay, error)
      return errString('oh no', new Context())::expectReject('Seriously what is your problem')
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
