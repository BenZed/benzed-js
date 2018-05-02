import { expect } from 'chai'

import type, { string, number, bool, arrayOf, oneOfType } from './types'

import { OPTIONAL_CONFIG } from '../util/symbols'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('stock type validators', () => {

  describe('instanceOf() || typeOf()', () => {

    function Foo () {}

    const foo = type(Foo)

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
        const fooWithErr = type(Foo, err)
        expect(fooWithErr({ }))
          .to.have.property('message', err)
      })

      it('cast function', () => {
        const fooWithCast = type(Foo, value => new Foo())
        expect(fooWithCast(true))
          .to.be.instanceof(Foo)
      })

    })

    describe('can compose other type functions', () => {

      it('type functions can be used as types', () => {

        const nestedBool = type(bool)

        expect(nestedBool(true))
          .to.be.equal(true)

      })

    })

  })

  describe('string()', () => {

    const str = string()

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
        const numWithCast = number(value => Number.isNaN(value) ? 0 : value)
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

  describe('bool()', () => {

    const b = bool()

    it('returns if value could not be cast to number', () => {
      expect(
        b(100)
      ).to.have.property('message', 'Must be of type: Boolean')
    })

    it('null and undefined are ignored', () => {

      expect(b(null))
        .to
        .equal(null)

      expect(b(undefined))
        .to
        .equal(undefined)
    })

    describe('takes a config', () => {

      const err = 'That\'s not a boolean.'

      it('err string', () => {
        const boolWithErr = bool(err)
        expect(boolWithErr(NaN))
          .to.have.property('message', err)
      })

      it('cast function', () => {
        const boolWithCast = bool(value => !!value)
        expect(boolWithCast(NaN))
          .to.be.equal(false)
      })

    })

    it('is optionally configurable', () => {
      expect(bool).to.have.property(OPTIONAL_CONFIG)
    })

    describe('default casting', () => {

      it('it casts string if string is explicitly equal to true or value, case insensitive', () => {

        expect(b('true')).to.equal(true)
        expect(b('TRUE')).to.equal(true)
        expect(b('false')).to.equal(false)
        expect(b('FALSE')).to.equal(false)

      })

      it('it casts number if number is explicitly equal to 1 or 0', () => {

        expect(b(1)).to.equal(true)
        expect(b(0)).to.equal(false)

      })

      it('calls valueOf on objects', () => {

        class Bool {

          constructor (count) {
            this.count = count
          }

          valueOf () {
            return this.count > 0
          }
        }

        expect(b(new Bool(1000))).to.equal(true)
        expect(b(new Bool(-1000))).to.equal(false)

        expect(b({})).to.have.property('message', 'Must be of type: Boolean')

      })
    })
  })

  describe('arrayOf()', () => {

    const arrayOfNumber = arrayOf(Number)

    const arrayOfBool = arrayOf(bool)

    it('returns an error if value cannot be cast to an Array of type', () => {
      expect(arrayOfNumber([ 1, 2, 3, 'nerd' ]))
        .to.have.property('message', 'Must be an Array of Numbers')
    })

    it('returns input, otherwise', () => {
      expect(arrayOfNumber([ 1, 2, 3 ]))
        .to.be.deep.equal([ 1, 2, 3 ])
    })

    it('casts input to array', () => {
      expect(arrayOfNumber(1))
        .to.deep.equal([1])
    })

    it('can take other type functions', () => {
      expect(arrayOfBool([ true, false ]))
        .to.deep.equal([ true, false ])
    })

    it('type functions throw proper default errors', () => {
      expect(arrayOfBool([ 100 ]))
        .to.have.property('message', 'Must be an Array of Booleans')
    })

    it('uses cast functions defined by other type functions', () => {

      const arrayOfNum = arrayOf(number)
      expect(arrayOfNum([ '0', '1', '2' ]))
        .to.deep.equal([ 0, 1, 2 ])

      const arrayOfBoolOrNumber = arrayOf(oneOfType(bool, number))

      expect(arrayOfBoolOrNumber(['0', 'true']))
        .to.deep.equal([0, true])

    })

    it('cast function in config overrides type cast functions, if provided', () => {

      const cast = value => value === 'ONE THOUSAND' ? 1000 : value

      const arrayOfNumber = arrayOf(number, cast)

      expect(arrayOfNumber('ONE THOUSAND'))
        .to.deep.equal([ 1000 ])

    })

  })

  describe('oneOfType()', () => {

    const isBoolOrNumber = oneOfType(Boolean, Number)

    it('returns an error if input is not one of many types', () => {
      expect(isBoolOrNumber('lol'))
        .to.have.property('message', 'Must be one of type: Boolean or Number')
    })

    it('returns value otherwise', () => {
      expect(isBoolOrNumber(100))
        .to.equal(100)

      expect(isBoolOrNumber(true))
        .to.equal(true)
    })

    describe('takes a config', () => {
      const err = 'That\'s not a boolean or a number.'
      it('err string', () => {
        const boolOrNumWithError = oneOfType(Boolean, Number, err)
        expect(boolOrNumWithError(NaN))
          .to.have.property('message', err)
      })
    })

    it('can be nested with other type functions', () => {

      const stringOrArrayOf = oneOfType(String, arrayOf(String))

      expect(stringOrArrayOf('str'))
        .to.be.equal('str')

      expect(stringOrArrayOf(['str']))
        .to.deep.equal(['str'])

      expect(stringOrArrayOf([ 0 ]))
        .to.have.property('message', 'Must be one of type: String or Array of Strings')

      const arrayOfBoolsOrArrayOfNums = oneOfType(arrayOf(bool), arrayOf(number))

      expect(arrayOfBoolsOrArrayOfNums('no friggen way skin'))
        .to.have.property('message', 'Must be one of type: Array of Booleans or Array of Numbers')

    })

  })
})
