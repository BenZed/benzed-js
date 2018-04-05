import { expect } from 'chai'

import { includes, indexOf, lastIndexOf } from '../src'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const includers = {}
includers.argument = (a, b) => includes(a, b)
includers.bound = (a, b) => a::includes(b)

const indexers = {}
indexers.argument = (a, b) => indexOf(a, b)
indexers.bound = (a, b) => a::indexOf(b)

const lastIndexers = {}
lastIndexers.argument = (a, b) => lastIndexOf(a, b)
lastIndexers.bound = (a, b) => a::lastIndexOf(b)

const describer = {}
describer.argument = `method(arr, ...params)`
describer.bound = `arr::method(...params)`

describe('array-like helpers', () => {

  for (const method in describer) {

    const indexer = indexers[method]
    const includer = includers[method]
    const lastIndexer = lastIndexers[method]

    describe(`${method} syntax: ${describer[method]}`, () => {

      describe('indexOf()', () => {

        it('returns the index of a primitive in an array', () => {
          const arr = [ 0, 1, 2, 3, 4, 5, 6 ]
          expect(indexer(arr, 6)).to.equal(6)
        })

        it('returns the index of a value-equal object in an array', () => {
          const arr = [ { foo: 'bar' }, { cake: 'town' } ]
          expect(indexer(arr, { cake: 'town' })).to.equal(1)
        })

        it('works on array-likes', () => {
          const arrlike = {
            length: 2,
            0: { foo: 'bar' },
            1: { cake: 'town' },
            2: { fuck: 'you, jimmy' }
          }
          expect(indexer(arrlike, { cake: 'town' })).to.equal(1)
        })

      })

      describe('includes()', () => {

        it('returns true if an arraylike has an item', () => {
          const arr = [ 0, 1, 2, 3, 4, 5 ]
          return expect(includer(arr, 3)).to.be.true
        })

        it('works on value-equal objects', () => {
          const arr = [ { foo: 'bar' }, { cake: 'town' } ]
          return expect(includer(arr, { cake: 'town' })).to.be.true
        })

        it('works on any arraylike', () => {
          const arrlike = {
            length: 2,
            0: { foo: 'bar' },
            1: { cake: 'town' },
            2: { fuck: 'you, jimmy' }
          }
          return expect(includer(arrlike, { cake: 'town' })).to.be.true
        })

      })

      describe('lastIndexOf()', () => {
        it('returns the last index of a value', () => {
          const arr = [ 0, 1, 1, 2 ]
          return expect(lastIndexer(arr, 1)).to.equal(2)
        })

        it('works on value equal objects', () => {
          const arr = [ { foo: 'bar' }, { cake: 'town' }, { cake: 'town' }, { a: 'b' } ]
          expect(lastIndexer(arr, { cake: 'town' })).to.equal(2)
        })

        it('works on any arraylike', () => {
          const arrlike = {
            length: 3,
            0: { foo: 'bar' },
            1: { cake: 'town' },
            2: { cake: 'town' },
            3: { fuck: 'you, jimmy' }
          }
          return expect(lastIndexOf(arrlike, { cake: 'town' })).to.equal(2)
        })
      })

    })
  }

})
