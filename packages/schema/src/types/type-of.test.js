import { expect } from 'chai'

import typeOf from './type-of'
import bool from './bool'

import { cast } from '../validators'

import { expectResolve } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('typeOf()', () => {

  function Foo () {}

  let foo
  before(() => {
    foo = typeOf(Foo)
  })

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

    describe('err string', () => {
      it('alters error message', () => {
        const fooWithErr = typeOf(Foo, err)
        expect(fooWithErr({ }))
          .to.have.property('message', err)
      })
    })

    describe('cast function', () => {
      it('cast function', () => {
        const fooWithCast = typeOf({ type: Foo, cast: value => new Foo() })
        expect(fooWithCast(true))
          .to.be.instanceof(Foo)
      })
      it('cast functions are properly found in args', () => {

        const stringToFoo = s => s === 'foo' ? new Foo() : s

        const fooWithAutoCast = typeOf(cast(stringToFoo), Foo)

        expect(fooWithAutoCast('foo')).to.not.be.instanceof(Error)

      })
    })

    describe('type constructor', () => {
      it('determines type constructor', () => {
        const string = typeOf(String)
        expect(string('wee'))
          .to.equal('wee')
      })
    })

    describe('validator functions', () => {

      it('runs additional validators after type', () => {

        const short = value => value == null || value.length <= 3
          ? value
          : new Error('Too long!')

        const lower = value => value != null
          ? value.toLowerCase()
          : value

        const shortString = typeOf(String, short, lower)

        expect(shortString('ANT')).to.be.equal('ant')
        expect(shortString('FAIL')).to.have.property('message', 'Too long!')

      })

      it('can be asyncronous', async () => {

        const delay = value => Promise.resolve(value)
        const error = value => Promise.reject(new Error('Seriously what is your problem'))

        const delayString = typeOf(String, delay)
        await delayString('foobar')::expectResolve(ers => ers.to.equal('foobar'))

        const errString = typeOf(String, delay, error)
        return errString('oh no')
          ::expectResolve(ers =>
            ers.to.have.property('message', 'Seriously what is your problem')
          )
      })
    })
  })

  describe('cannot compose other type functions', () => {

    it('type functions cannot be used as types', () => {

      expect(() => {
        typeOf(bool)
      }).to.throw('Cannot nest type functions in typeOf')

    })
  })
})
