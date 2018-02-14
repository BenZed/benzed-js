import { expect } from 'chai'
import { copy } from '../src'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('copy()', () => {

  describe('copies primitives', () => {

    const primitives = [
      null, undefined, 1, -1, 0, Infinity,
      -Infinity, true, false, 'some-string-value', ''
    ]

    for (const value of primitives)
      it(`works on ${value === '' ? '<empty string>' : value}`, () =>
        expect(copy(value)).to.equal(value)
      )

    it('works on Symbols', () => {
      const symbol = Symbol('new symbol')
      expect(copy(symbol)).to.equal(symbol)
    })

    it('works on NaN', () => {
      expect(Number.isNaN(copy(NaN))).to.equal(true)
    })

  })

  describe('copies objects', () => {

    it('works on plain objects', () => {

      const obj = {
        key: 'value'
      }

      const obj2 = obj::copy()

      expect(obj2).to.deep.equal(obj)

    })

    it('works on arrays', () => {

      const arr = [ 1, 2, 3, 4, 5 ]

      expect(copy(arr)).to.deep.equal(arr)

    })

    it('copies symbolic properties', () => {

      const KEY = Symbol('key')

      const obj = {}

      Object.defineProperty(obj, KEY, {
        value: 'foo',
        writable: true,
        enumerable: false,
        configurable: false
      })

      const obj2 = obj::copy()

      expect(obj2).to.have.property(KEY)

    })

    it('is recursive', () => {

      const obj = {
        foo: {
          bar: true
        }
      }

      const obj2 = obj::copy()

      expect(obj2.foo).to.not.equal(obj.foo)
      expect(obj).to.deep.equal(obj2)

    })

  })

  describe('copies iterables', () => {

    it('arrays', () => {

      const arr = [ 1, 2, 3, 4, 5 ]
      const arr2 = arr::copy()

      expect(arr2).to.deep.equal(arr)
      expect(arr2).to.not.equal(arr)

    })

    it('arrays recursively', () => {

      const arr = [ { foo: false }, 1, 2, 3, 4 ]
      const arr2 = arr::copy()

      expect(arr2[0]).to.deep.equal(arr[0])
      expect(arr2[0]).to.not.equal(arr[0])

    })

    it('sets', () => {

      const set = new Set([ 1, 2, 3, 4, 5 ])

    })

  })

})
