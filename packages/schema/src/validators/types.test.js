import { expect } from 'chai'

import type, { string, number, bool } from './types'

import { OPTIONAL_CONFIG } from '../util/symbols'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('stock type validators', () => {

  describe('type()', () => {

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

      it('if configured as an object, can use multiple types', () => {

        const customFooOrString = type({
          types: [Foo, String],
          err: 'Gotta be a Foo or a String, bro.',
          cast: value => value === true ? new Foo() : value === false ? 'false' : null
        })

        const foo = new Foo()
        expect(customFooOrString(foo)).to.be.equal(foo)

        const str = 'string'
        expect(customFooOrString(str)).to.be.equal(str)

        const t = true
        expect(customFooOrString(t)).to.be.instanceof(Foo)

        const f = false
        expect(customFooOrString(f)).to.be.equal('false')

        expect(customFooOrString(1000)).to.have.property('message', 'Gotta be a Foo or a String, bro.')
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
})
