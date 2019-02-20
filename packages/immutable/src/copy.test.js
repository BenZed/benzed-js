import { assert, expect } from 'chai'
import { Test } from '@benzed/dev'
import copy from './copy'
import { $$copy } from './symbols'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod.only(copy, copier => {

  describe('adds $$copy symbol to standard types', () => {
    for (const Type of [ String, Number, Boolean, Array ])
      it(`${Type.name}`, () => {
        assert(
          typeof Type.prototype[$$copy] === 'function',
          `${Type.name} does not implement $$copy`
        )
      })
  })

  describe('copies primitives', () => {

    const primitives = [
      null, undefined, 1, -1, 0, Infinity,
      -Infinity, true, false, 'some-string-value', ''
    ]

    for (const value of primitives)
      it(`works on ${value === '' ? '""' : value}`, () =>
        expect(copier(value)).to.equal(value)
      )

    it('works on NaN', () => {
      expect(Number.isNaN(copier(NaN))).to.equal(true)
    })

    it('ignores RegExp', () => {
      const regexp = /\d/
      expect(copier(regexp)).to.be.equal(regexp)
    })

    it('ignores Symbols', () => {
      const symbol = Symbol('new symbol')
      expect(copier(symbol)).to.equal(symbol)
    })

    it('works on Dates', () => {
      const date = new Date()
      const date2 = copier(date)
      expect(date2.getTime()).to.be.equal(date.getTime())
      expect(date2).to.not.be.equal(date)
    })

    it('looks for copy methods on functions before returning them mutably', () => {
      const one = () => 'one'
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

    it('resolves circular references', () => {

      const circle = {
        foo: 'bar'
      }
      circle.circle = circle

      const circle2 = copier(circle)

      expect(circle2.circle).to.be.equal(circle2)

    })

    it('resolves circlular references in arrays', () => {
      const array = []
      array.push(array)

      const array2 = copy(array)
      expect(array2).to.be.deep.equal([array2])
      expect(array2[0]).to.be.equal(array2)
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

    describe('typed arrays', () => {
      for (const TypedArray of [
        Int8Array,
        Uint8Array,
        Uint8ClampedArray,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array
      ])
        it(`works on ${TypedArray.name}`, () => {
          const opt = new TypedArray([ 1, 2, 4, 8, 16 ])
          const opt2 = copier(opt)
          expect(opt2).to.be.deep.equal(opt)
          expect(opt2).to.not.be.equal(opt)
          expect(opt2).to.be.instanceof(TypedArray)
        })

    })

    it('buffers', () => {
      const buffer = Buffer.from([ 0, 1, 2, 3, 4, 5 ])
      const buffer2 = copier(buffer)
      expect(buffer2).to.be.deep.equal(buffer)
      expect(buffer2).to.be.instanceof(Buffer)
      expect(buffer2).to.not.equal(buffer)
    })

    it('buffers recursive', () => {
      const buffer = Buffer.from([ 0, 1, 2, 3, 4, 5 ])
      const buffer2 = copier(buffer)
      expect(buffer2).to.be.deep.equal(buffer)
      expect(buffer2).to.be.instanceof(Buffer)
      expect(buffer2).to.not.equal(buffer)
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

    it('weak collections return themselves', () => {

      // due to the nature of weak collections, we cannot get a list of objects
      // inside of them, so they just return themselves

      const map = new WeakMap()
      const map2 = copier(map)
      expect(map2).to.equal(map)

      const set = new WeakSet()
      const set2 = copier(set)
      expect(set2).to.equal(set)

    })
  })

  describe('handles objects created outside the prototype chain', () => {
    it('Object.create(null)', () => {
      const hash = Object.create(null)
      hash.one = 1

      expect(copier(hash)).to.not.be.equal(hash)
      expect(copier(hash)).to.be.deep.equal(hash)
    })
  })

})
