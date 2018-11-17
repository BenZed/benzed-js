import { expect } from 'chai'
import { copy, $$copy } from '../src'

import Test from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(copy, copier => {

  describe('copies primitives', () => {

    const primitives = [
      null, undefined, 1, -1, 0, Infinity,
      -Infinity, true, false, 'some-string-value', ''
    ]

    for (const value of primitives)
      it(`works on ${value === '' ? '""' : value}`, () =>
        expect(copier(value)).to.equal(value)
      )

    it('works on Symbols', () => {
      const symbol = Symbol('new symbol')
      expect(copier(symbol)).to.equal(symbol)
    })

    it('works on NaN', () => {
      expect(Number.isNaN(copier(NaN))).to.equal(true)
    })

    it('ignores RegExp', () => {
      const regexp = /\d/
      expect(copier(regexp)).to.be.equal(regexp)
    })

    it('works on Dates', () => {
      const date = new Date()
      const date2 = copier(date)
      expect(date2.getTime()).to.be.equal(date.getTime())
      expect(date2).to.not.be.equal(date)
    })

    it('looks for copy methods on functions before returning them mutably', () => {
      const one = () => { return 1 }
      one[$$copy] = () => 1

      expect(copier(one)).to.be.equal(1)
    })

  })

  describe('copies objects', () => {

    it('works on plain objects', () => {
      const obj = { key: 'value' }
      const obj2 = copier(obj)

      expect(obj2).to.deep.equal(obj)
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

      const obj2 = copier(obj)

      expect(obj2).to.have.property(KEY)

    })

    it('is recursive', () => {

      const obj = {
        foo: {
          bar: true
        }
      }

      const obj2 = copier(obj)

      expect(obj2.foo).to.not.equal(obj.foo)
      expect(obj).to.deep.equal(obj2)

    })

    it('ignores circular references', () => {

      const circle = {
        foo: 'bar'
      }

      circle.circle = circle

      expect(copier(circle)).to.deep.equal({ foo: 'bar' })

    })

  })

  describe('copies iterables', () => {

    it('arrays', () => {
      const arr = [ 1, 2, 3, 4, 5 ]
      const arr2 = copier(arr)

      expect(arr2).to.deep.equal(arr)
      expect(arr2).to.not.equal(arr)
    })

    it('arrays with one length', () => {
      const arrOfZero = [ 5 ]
      expect(copier(arrOfZero))
        .to.be
        .deep.equal([ 5 ])
    })

    it('array subclasses', () => {

      class MyArray extends Array { }

      let myArray = new MyArray(0, 1, 2, 3, 4)

      myArray = myArray.map(v => v ** 2)

      const myArray2 = copier(myArray)

      expect(myArray2).to.not.equal(myArray)
      expect(myArray2).to.deep.equal(myArray)
      expect(myArray2).to.be.instanceof(MyArray)

    })

    it('arrays recursively', () => {

      const arr = [ { foo: false }, 1, 2, 3, 4 ]
      const arr2 = copier(arr)

      expect(arr2[0]).to.deep.equal(arr[0])
      expect(arr2[0]).to.not.equal(arr[0])

    })

    it('sets', () => {

      const set = new Set([ 1, 2, 3, 4, 5 ])
      const set2 = copier(set)

      expect(set2).to.be.instanceof(Set)
      expect(set2).to.deep.equal(set)

    })

    it('sets recursively', () => {

      const set = new Set([ { foo: false }, 2, 3, 4, 5 ])
      const set2 = copier(set)

      expect(set2).to.be.instanceof(Set)
      expect(set2).to.deep.equal(set)
      expect([...set2][0]).to.not.equal([...set][0])

    })

    it('maps', () => {

      const map = new Map([[ 'one', 1 ], ['two', 2]])
      const map2 = copier(map)

      expect(map2).to.be.instanceof(Map)
      expect(map2).to.deep.equal(map)

    })

    it('maps recursively', () => {

      const map = new Map([[ 'one', { foo: false } ], ['two', 2]])
      const map2 = copier(map)

      expect(map2).to.be.instanceof(Map)
      expect(map2).to.deep.equal(map)
      expect(map2.get('one')).to.not.equal(map.get('one'))

    })
  })
})
