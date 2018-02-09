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

      const KEY = Symbol('key')
      const obj = {
        key: 'value'
      }

      Object.defineProperty(obj, KEY, {
        value: 'this-is-insane',
        writable: true,
        enumerable: false,
        configurable: false
      })

      const obj2 = obj::copy()

      expect(obj2).to.deep.equal(obj)

      expect(obj2).to.have.property(KEY)

      expect(obj).to.deep.equal(obj2)

      const arr = [ 1, 2, 3, 4, 5 ]

      expect(copy(arr)).to.deep.equal(arr)
      expect(arr::copy()).to.deep.equal(arr)

      const iObj = {
        kira: 0,
        i: 1,
        love: 2,
        you: 3,

        * [Symbol.iterator] () {
          for (const key in this)
            yield this[key]
        }
      }

      expect(iObj::copy()).to.deep.equal(iObj)

      console.log(iObj)

    })

  })

})
