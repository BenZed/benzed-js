import { expect } from 'chai'

import { push, pop, shift, unshift, splice, reverse, sort, shuffle,
  includes, indexOf, lastIndexOf } from '../src'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

// const includers = {}
// includers.argument = (a, b) => includes(a, b)
// includers.bound = (a, b) => a::includes(b)
//
// const indexers = {}
// indexers.argument = (a, b) => indexOf(a, b)
// indexers.bound = (a, b) => a::indexOf(b)
//
// const lastIndexers = {}
// lastIndexers.argument = (a, b) => lastIndexOf(a, b)
// lastIndexers.bound = (a, b) => a::lastIndexOf(b)
//
// const describer = {}
// describer.argument = `method(arr, ...params)`
// describer.bound = `arr::method(...params)`

const TestMethod = {

  * [Symbol.iterator]  () {
    for (const type of ['argument', 'bound'])
      yield type
  },

  create (func, type) {

    const name = func.name || 'method'
    const bound = type === 'bound'

    const describer = bound
      ? `obj::${name}(...params)`
      : `${name}(obj, ...params)`

    const method = bound
      ? (obj, ...args) => obj::func(...args)
      : (...args) => func(...args)

    method.toString = () => describer

    return method
  }
}

const NON_ARRAY_LIKES = [
  { foo: 'bar' },
  new Map([{foo: 'bar'}, {one: 1}]),
  new Set(['one', 'two']),
  Symbol('symbol'),
  new Date(),
  'strings-arnt-array-like',
  1,
  true,
  false,
  { length: 'cake' }
]

describe.only('array-like helpers', () => {

  describe('indexOf()', () => {

    for (const type of TestMethod) {
      const indexer = TestMethod.create(indexOf, type)
      describe(`${type} syntax: ${indexer}`, () => {

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
            2: { you: 'suck, jimmy' }
          }
          expect(indexer(arrlike, { cake: 'town' })).to.equal(1)
        })

        it('throws on non-array likes', () => {
          for (const badValue of NON_ARRAY_LIKES)
            expect(() => indexer(badValue)).to.throw('called on an array-like')
        })

      })
    }

  })

  describe('includes()', () => {

    for (const type of TestMethod) {
      const includer = TestMethod.create(includes, type)
      describe(`${type} syntax: ${includer}`, () => {

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
            2: { you: 'suck, jimmy' }
          }
          return expect(includer(arrlike, { cake: 'town' })).to.be.true
        })

        it('throws on non-array likes', () => {
          for (const badValue of NON_ARRAY_LIKES)
            expect(() => includer(badValue)).to.throw('called on an array-like')
        })

      })

    }
  })

  describe('lastIndexOf()', () => {

    for (const type of TestMethod) {
      const lastIndexer = TestMethod.create(lastIndexOf, type)
      describe(`${type} syntax: ${lastIndexer}`, () => {

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
            3: { you: 'suck, jimmy' }
          }
          return expect(lastIndexer(arrlike, { cake: 'town' })).to.equal(2)
        })

        it('throws on non-array likes', () => {
          for (const badValue of NON_ARRAY_LIKES)
            expect(() => lastIndexer(badValue)).to.throw('called on an array-like')
        })

      })
    }
  })

  describe(`push()`, () => {
    for (const type of TestMethod) {
      const pusher = TestMethod.create(push, type)
      describe(`${type} syntax: ${pusher}`, () => {
        it('does not mutate original array', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = pusher(array, 6)
          expect(clone).to.not.equal(array)
        })
        it('same behaviour as Array.prototype.push', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = pusher(array, 6)
          array.push(6)
          expect(clone).to.deep.equal(array)
        })
        it('works on array-likes', () => {
          const arraylike = { 0: 'zero', 1: 'one', length: 2 }

          const clone = pusher(arraylike, 'two')
          arraylike::Array.prototype.push('two')

          expect(clone).to.not.equal(arraylike)
          expect(clone).to.deep.equal(arraylike)
          expect(clone).to.have.length(3)
        })
        it('throws on non-array likes', () => {
          for (const badValue of NON_ARRAY_LIKES)
            expect(() => pusher(badValue)).to.throw('called on an array-like')
        })
      })
    }
  })

  describe(`pop()`, () => {
    for (const type of TestMethod) {
      const popper = TestMethod.create(pop, type)
      describe(`${type} syntax: ${popper}`, () => {
        it('does not mutate original array', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = popper(array)
          expect(clone).to.not.equal(array)
        })
        it('same behaviour as Array.prototype.pop', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = popper(array)
          array.pop()
          expect(clone).to.deep.equal(array)
        })
        it('works on array-likes', () => {
          const arraylike = { 0: 'zero', 1: 'one', length: 2 }

          const clone = popper(arraylike)
          arraylike::Array.prototype.pop()

          expect(clone).to.not.equal(arraylike)
          expect(clone).to.deep.equal(arraylike)
          expect(clone).to.have.length(1)
        })
        it('throws on non-array likes', () => {
          for (const badValue of NON_ARRAY_LIKES)
            expect(() => popper(badValue)).to.throw('called on an array-like')
        })
      })
    }
  })

  describe(`shift()`, () => {
    for (const type of TestMethod) {
      const shifter = TestMethod.create(shift, type)
      describe(`${type} syntax: ${shifter}`, () => {
        it('does not mutate original array', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = shifter(array)
          expect(clone).to.not.equal(array)
        })
        it('same behaviour as Array.prototype.shift', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = shifter(array)
          array.shift()
          expect(clone).to.deep.equal(array)
        })
        it('works on array-likes', () => {
          const arraylike = { 0: 'zero', 1: 'one', length: 2 }

          const clone = shifter(arraylike)
          arraylike::Array.prototype.shift()

          expect(clone).to.not.equal(arraylike)
          expect(clone).to.deep.equal(arraylike)
          expect(clone).to.have.length(1)
        })
        it('throws on non-array likes', () => {
          for (const badValue of NON_ARRAY_LIKES)
            expect(() => shifter(badValue)).to.throw('called on an array-like')
        })
      })
    }
  })

  describe(`unshift()`, () => {
    for (const type of TestMethod) {
      const unshifter = TestMethod.create(unshift, type)
      describe(`${type} syntax: ${unshifter}`, () => {
        it('does not mutate original array', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = unshifter(array, -1)
          expect(clone).to.not.equal(array)
        })
        it('same behaviour as Array.prototype.unshift', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = unshifter(array, -1)
          array.unshift(-1)
          expect(clone).to.deep.equal(array)
        })
        it('works on array-likes', () => {
          const arraylike = { 0: 'zero', 1: 'one', length: 2 }

          const clone = unshifter(arraylike, 'minus-one')
          arraylike::Array.prototype.unshift('minus-one')

          expect(clone).to.not.equal(arraylike)
          expect(clone).to.deep.equal(arraylike)
          expect(clone).to.have.length(3)
        })
        it('throws on non-array likes', () => {
          for (const badValue of NON_ARRAY_LIKES)
            expect(() => unshifter(badValue)).to.throw('called on an array-like')
        })
      })
    }
  })

  describe(`splice()`, () => {
    for (const type of TestMethod) {
      const splicer = TestMethod.create(splice, type)
      describe(`${type} syntax: ${splicer}`, () => {
        it('does not mutate original array', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = splicer(array, 2, 1)
          expect(clone).to.not.equal(array)
        })
        it('same behaviour as Array.prototype.splice', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = splicer(array, 2, 1)
          array.splice(2, 1)
          expect(clone).to.deep.equal(array)
        })
        it('works on array-likes', () => {
          const arraylike = { 0: 'zero', 1: 'one', length: 2 }

          const clone = splicer(arraylike, 0, 0, 'one-point-five')
          arraylike::Array.prototype.splice(0, 0, 'one-point-five')

          expect(clone).to.not.equal(arraylike)
          expect(clone).to.deep.equal(arraylike)
          expect(clone).to.have.length(3)
        })
        it('throws on non-array likes', () => {
          for (const badValue of NON_ARRAY_LIKES)
            expect(() => splicer(badValue)).to.throw('called on an array-like')
        })
      })
    }
  })

  describe(`reverse()`, () => {
    for (const type of TestMethod) {
      const reverser = TestMethod.create(reverse, type)
      describe(`${type} syntax: ${reverser}`, () => {
        it('does not mutate original array', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = reverser(array)
          expect(clone).to.not.equal(array)
        })
        it('same behaviour as Array.prototype.reverse', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = reverser(array)
          array.reverse()
          expect(clone).to.deep.equal(array)
        })
        it('works on array-likes', () => {
          const arraylike = { 0: 'zero', 1: 'one', length: 2 }

          const clone = reverser(arraylike)
          arraylike::Array.prototype.reverse()

          expect(clone).to.not.equal(arraylike)
          expect(clone).to.deep.equal(arraylike)
          expect(clone).to.have.length(2)
        })
        it('throws on non-array likes', () => {
          for (const badValue of NON_ARRAY_LIKES)
            expect(() => reverser(badValue)).to.throw('called on an array-like')
        })
      })
    }
  })

  describe(`sort()`, () => {
    for (const type of TestMethod) {
      const sorter = TestMethod.create(sort, type)
      describe(`${type} syntax: ${sorter}`, () => {
        it('does not mutate original array', () => {
          const array = [ 1, 0, 4, 2, 5, 3 ]
          const clone = sorter(array)
          expect(clone).to.not.equal(array)
        })
        it('same behaviour as Array.prototype.sort', () => {
          const array = [ 1, 0, 4, 2, 5, 3 ]
          const clone = sorter(array)
          array.sort()
          expect(clone).to.deep.equal(array)
        })
        it('works on array-likes', () => {
          const arraylike = { 0: 'base', 1: 'ace', length: 2 }

          const clone = sorter(arraylike)
          arraylike::Array.prototype.sort()

          expect(clone).to.not.equal(arraylike)
          expect(clone).to.deep.equal(arraylike)
          expect(clone).to.have.length(2)
        })
        it('throws on non-array likes', () => {
          for (const badValue of NON_ARRAY_LIKES)
            expect(() => sorter(badValue)).to.throw('called on an array-like')
        })
      })
    }
  })

  describe(`shuffle()`, () => {
    for (const type of TestMethod) {
      const shuffler = TestMethod.create(shuffle, type)
      describe(`${type} syntax: ${shuffler}`, () => {

        it('does not mutate original array', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = shuffler(array)
          expect(clone).to.not.equal(array)
        })

        it('same behaviour as @benzed/array/shuffle', () => {
          const array = [ 0, 1, 2, 3, 4, 5 ]
          const clone = shuffler(array)
          shuffler(array)
          expect(clone.every(v => array.includes(v))).to.be.equal(true)
          expect(clone.length).to.be.equal(array.length)
        })

        it('works on array-likes', () => {

          const arraylike = {
            0: 'base',
            1: 'ace',
            length: 2
          }

          const clone = shuffler(arraylike)
          shuffle(arraylike)

          expect(clone).to.not.equal(arraylike)
          expect(clone.length).to.be.equal(arraylike.length)
        })

        it('throws on non-numeric-length values', () => {
          for (const badValue of NON_ARRAY_LIKES)
            if (typeof badValue !== 'string')
              expect(() => shuffler(badValue)).to.throw('called on a value with numeric length')
        })

      })
    }
  })

})
