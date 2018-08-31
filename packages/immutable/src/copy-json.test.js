import { expect } from 'chai'

import Test from '@benzed/dev'

import copyJson from './copy-json'
import { CIRCULAR } from './symbols'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(copyJson, copyJson => {

  describe('copies data in a json compatible format', () => {

    const primitives = [ 0, false, true, 1, 'string', null ]
    for (const primitive of primitives)
      it(`${typeof primitive} ${primitive} returns ${primitive}`, () => {
        expect(copyJson(primitive)).to.be.equal(primitive)
      })

    it('undefined returns null', () => {
      expect(copyJson(undefined)).to.be.equal(null)
    })

    it('Infinity returns "Infinity"', () => {
      expect(copyJson(Infinity)).to.be.equal('Infinity')
      expect(copyJson(-Infinity)).to.be.equal('-Infinity')
    })

    it('NaN returns "NaN"', () => {
      expect(copyJson(NaN)).to.be.equal('NaN')
    })

    it('functions return null', () => {
      expect(copyJson(function () {})).to.be.equal(null)
    })

    it('symbols return null', () => {
      const BAR = Symbol('bar')
      expect(copyJson(BAR)).to.be.equal(null)
    })

    it('CIRCULAR symbol returns null', () => {
      expect(copyJson(CIRCULAR)).to.be.equal(null)
    })

  })

  describe('works on objects', () => {

    it('plain', () => {
      const obj = { foo: 'bar' }

      expect(copyJson(obj)).to.be.deep.equal(obj)
      expect(copyJson(obj)).to.not.equal(obj)
    })

    it('symbol or function properties arnt included', () => {
      const BAR = Symbol('bar')
      const obj = {
        foo: 'bar',
        [BAR]: 'bar',
        toString () {
          return this.foo
        }
      }
      expect(copyJson(obj)).to.deep.equal({ foo: 'bar' })
    })

    it('circular references arn\'t included', () => {

      const foo = { bar: 'bar' }
      foo.foo = foo

      expect(copyJson(foo)).to.be.deep.equal({ bar: 'bar' })

    })

    it('works on custom objects', () => {

      const BAR = Symbol('bar')

      class Foo {
        bar = 'bar'
        cake = 'town'
        toString () {
          return this.bar + this.cake
        }
        [BAR] = 'bar'
      }

      expect(copyJson(new Foo())).to.be.deep.equal({ bar: 'bar', cake: 'town' })
    })
  })

  describe('objects can implement toJSON', () => {

    it('for custom json', () => {

      class Rank {
        constructor (name, value = 0) {
          this.name = name
          this.value = value
        }
        toJSON () {
          return this.name
        }
        valueOf () {
          return this.value
        }
      }

      const admiral = new Rank('admiral', 100)
      const seargant = new Rank('seargant', 50)

      expect(admiral > seargant).to.be.equal(true)
      expect(copyJson(admiral)).to.be.equal('admiral')
      expect(copyJson(seargant)).to.be.equal('seargant')

    })

    it('toJSON cant return invalid objects', () => {
      const obj = {
        toJSON () {
          return function () {}
        }
      }

      expect(copyJson(obj)).to.be.equal(null)
    })

    it('toJSON catches circular references', () => {
      const obj = {
        toJSON () {
          return obj
        }
      }

      expect(copyJson(obj)).to.be.deep.equal({})
    })

  })

  describe('works on iterables', () => {

    it('arrays', () => {

      const arr = [ 'one', 2, { foo: 'bar' },
        Symbol('bad'), function () {} ]

      expect(copyJson(arr)).to.be.deep.equal([
        'one', 2, { foo: 'bar' }
      ])

    })

    it('sets', () => {

      const set = new Set([
        'one', 'two', 'two', 3,
        Symbol('ace'), function () {}
      ])

      expect(copyJson(set)).to.be.deep.equal([
        'one', 'two', 3
      ])
    })

    it('maps', () => {
      const map = new Map([
        ['one', 1], ['two', 2], [Symbol('three'), 3], [function () {}, 4]
      ])

      expect(copyJson(map)).to.be.deep.equal([
        ['one', 1], ['two', 2], [3], [4]
      ])
    })

    it('custom iterables', () => {

      const KEY1 = Symbol('key1')
      const KEY2 = Symbol('key2')

      const iterable = {
        'one': 1,
        'two': 2,
        'three': 3,
        [KEY1]: 'value',
        [KEY2]: KEY1,
        func: () => {},
        * [Symbol.iterator] () {
          for (const key in this)
            yield this[key]

          yield this[KEY1]
          yield this[KEY2]
        }
      }

      expect(copyJson(iterable))
        .to.be.deep
        .equal([
          1, 2, 3, 'value'
        ])
    })
  })

})
