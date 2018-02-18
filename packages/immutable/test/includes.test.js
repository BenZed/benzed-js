import { expect } from 'chai'

import { includes, indexOf, lastIndexOf } from '../src'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('array-like helpers', () => {

  describe('indexOf()', () => {

    it('returns the index of a primitive in an array', () => {
      const arr = [ 0, 1, 2, 3, 4, 5, 6 ]
      expect(arr::indexOf(6)).to.equal(6)
      expect(indexOf(arr, 6)).to.equal(6)
    })

    it('returns the index of a value-equal object in an array', () => {
      const arr = [ { foo: 'bar' }, { cake: 'town' } ]
      expect(arr::indexOf({ cake: 'town' })).to.equal(1)
      expect(indexOf(arr, { cake: 'town' })).to.equal(1)
    })

    it('works on array-likes', () => {
      const arrlike = {
        length: 2,
        0: { foo: 'bar' },
        1: { cake: 'town' },
        2: { fuck: 'you, jimmy' }
      }
      expect(arrlike::indexOf({ cake: 'town' })).to.equal(1)
    })

  })

  describe('includes()', () => {

    it('returns true if an arraylike has an item', () => {
      const arr = [ 0, 1, 2, 3, 4, 5 ]
      return expect(arr.includes(3)).to.be.true
    })

    it('works on value-equal objects', () => {
      const arr = [ { foo: 'bar' }, { cake: 'town' } ]
      return expect(arr::includes({ cake: 'town' })).to.be.true
    })

    it('works on any arraylike', () => {
      const arrlike = {
        length: 2,
        0: { foo: 'bar' },
        1: { cake: 'town' },
        2: { fuck: 'you, jimmy' }
      }
      return expect(arrlike::includes({ cake: 'town' })).to.be.true
    })

  })

  describe('lastIndexOf()', () => {
    it('returns the last index of a value', () => {
      const arr = [ 0, 1, 1, 2 ]
      return expect(arr.lastIndexOf(1)).to.equal(2)
    })

    it('works on value equal objects', () => {
      const arr = [ { foo: 'bar' }, { cake: 'town' }, { cake: 'town' }, { a: 'b' } ]
      expect(arr::lastIndexOf({ cake: 'town' })).to.equal(2)
    })

    it('works on any arraylike', () => {
      const arrlike = {
        length: 3,
        0: { foo: 'bar' },
        1: { cake: 'town' },
        2: { cake: 'town' },
        3: { fuck: 'you, jimmy' }
      }
      return expect(arrlike::lastIndexOf({ cake: 'town' })).to.equal(2)
    })
  })

})
