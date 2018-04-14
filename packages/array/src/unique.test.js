import { expect } from 'chai'
import _unique from './unique'

import { inspect } from 'util'
import Test from '@benzed/test'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(_unique, unique => {

  describe('returns an array of input without duplicate elements', () => {
    it('[0,0,1,1,2,2,3,3] >> [0,1,2,3]', () => {
      const arr = [ 0, 0, 1, 1, 2, 2, 3, 3 ]
      const arr2 = unique(arr)

      expect(arr2).to.deep.equal([ 0, 1, 2, 3 ])
    })
    it('[Function, Function, Object, Object] >> [Function, Object]', () => {

      const arr = [ Function, Function, Object, Object ]
      const arr2 = unique(arr)

      expect(arr2).to.have.length(2)
      expect(arr2[0]).to.equal(Function)
      expect(arr2[1]).to.equal(Object)
    })

  })

  describe('works on numerical-length values', () => {

    const obj = {
      0: 'one',
      1: 'one',
      length: 2
    }

    it(`${inspect('foobar')} >> ['f','o','b','a','r']`, () => {
      const str = 'foobar'
      expect(unique(str).join('')).to.equal('fobar')
    })
    it(`${inspect(obj)} >> ['one']`, () => {
      expect(unique(obj)).to.deep.equal(['one'])
    })

  })

  describe('works on iterables', () => {

    const map = new Map([[0, 'one'], [1, 'one'], [2, 'one']])

    it(`(${inspect(map)}).values() >> [ 'one' ]`, () => {
      expect(unique(map.values())).to.deep.equal(['one'])
    })

    const custom = {
      * [Symbol.iterator] () {
        for (const key in this)
          yield this[key]
      },
      foo: 'bar',
      baz: 'bar'
    }

    it(`{foo: 'bar', baz: 'bar', @@iterator} >> ['bar']`, () => {
      expect(unique(custom)).to.deep.equal(['bar'])
    })

  })

})
