import { expect } from 'chai'

import { push, pop, shift, unshift, splice, reverse, sort, shuffle, unique,
  includes, indexOf, lastIndexOf, copy, $$equals } from '../src'

import Test from '@benzed/dev'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const NON_ARRAY_LIKES = [
  { foo: 'bar' },
  new Map([{ foo: 'bar' }, { one: 1 }]),
  new Set(['one', 'two']),
  Symbol('symbol'),
  new Date(),
  'strings-arnt-array-like',
  1,
  true,
  false,
  { length: 'cake' }
]

describe('array-like helpers', () => {

  Test.optionallyBindableMethod(indexOf, indexOf => {

    it('returns the index of a primitive in an array', () => {
      const arr = [ 0, 1, 2, 3, 4, 5, 6 ]
      expect(indexOf(arr, 6)).to.equal(6)
    })

    it('returns the index of a value-equal object in an array', () => {
      const arr = [ { foo: 'bar' }, { cake: 'town' } ]
      expect(indexOf(arr, { cake: 'town' })).to.equal(1)
    })

    it('works on array-likes', () => {
      const arrlike = {
        length: 2,
        0: { foo: 'bar' },
        1: { cake: 'town' },
        2: { you: 'suck, jimmy' }
      }
      expect(indexOf(arrlike, { cake: 'town' })).to.equal(1)
    })

    it('throws on non-array likes', () => {
      for (const badValue of NON_ARRAY_LIKES)
        expect(() => indexOf(badValue)).to.throw('called on an array-like')
    })

  })

  Test.optionallyBindableMethod(includes, includes => {

    it('returns true if an arraylike has an item', () => {
      const arr = [ 0, 1, 2, 3, 4, 5 ]
      return expect(includes(arr, 3)).to.be.true
    })

    it('works on value-equal objects', () => {
      const arr = [ { foo: 'bar' }, { cake: 'town' } ]
      return expect(includes(arr, { cake: 'town' })).to.be.true
    })

    it('works on any arraylike', () => {
      const arrlike = {
        length: 2,
        0: { foo: 'bar' },
        1: { cake: 'town' },
        2: { you: 'suck, jimmy' }
      }
      return expect(includes(arrlike, { cake: 'town' })).to.be.true
    })

    it('throws on non-array likes', () => {
      for (const badValue of NON_ARRAY_LIKES)
        expect(() => includes(badValue)).to.throw('called on an array-like')
    })

  })

  Test.optionallyBindableMethod(lastIndexOf, lastIndexOf => {

    it('returns the last index of a value', () => {
      const arr = [ 0, 1, 1, 2 ]
      return expect(lastIndexOf(arr, 1)).to.equal(2)
    })

    it('works on value equal objects', () => {
      const arr = [ { foo: 'bar' }, { cake: 'town' }, { cake: 'town' }, { a: 'b' } ]
      expect(lastIndexOf(arr, { cake: 'town' })).to.equal(2)
    })

    it('works on any arraylike', () => {
      const arrlike = {
        length: 3,
        0: { foo: 'bar' },
        1: { cake: 'town' },
        2: { cake: 'town' },
        3: { you: 'suck, jimmy' }
      }
      return expect(lastIndexOf(arrlike, { cake: 'town' })).to.equal(2)
    })

    it('throws on non-array likes', () => {
      for (const badValue of NON_ARRAY_LIKES)
        expect(() => lastIndexOf(badValue)).to.throw('called on an array-like')
    })

  })

  Test.optionallyBindableMethod(push, push => {

    it('does not mutate original array', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]

      const array2 = array::copy()
      const clone = push(array2, 6)

      // proves unique did not mutate array
      expect(array2).to.deep.equal(array)

      // proves output is not same as input
      expect(clone).to.not.equal(array)
    })
    it('same behaviour as Array.prototype.push', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const clone = push(array, 6)
      array.push(6)
      expect(clone).to.deep.equal(array)
    })
    it('works on array-likes', () => {
      const arraylike = { 0: 'zero', 1: 'one', length: 2 }

      const clone = push(arraylike, 'two')
      arraylike::Array.prototype.push('two')

      expect(clone).to.not.equal(arraylike)
      expect(clone).to.deep.equal(arraylike)
      expect(clone).to.have.length(3)
    })
    it('throws on non-array likes', () => {
      for (const badValue of NON_ARRAY_LIKES)
        expect(() => push(badValue)).to.throw('called on an array-like')
    })
  })

  Test.optionallyBindableMethod(pop, pop => {

    it('does not mutate original array', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const array2 = array::copy()
      const clone = pop(array2)

      // proves unique did not mutate array
      expect(array2).to.deep.equal(array)

      // proves output is not same as input
      expect(clone).to.not.equal(array)
    })
    it('same behaviour as Array.prototype.pop', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const clone = pop(array)
      array.pop()
      expect(clone).to.deep.equal(array)
    })
    it('works on array-likes', () => {
      const arraylike = { 0: 'zero', 1: 'one', length: 2 }

      const clone = pop(arraylike)
      arraylike::Array.prototype.pop()

      expect(clone).to.not.equal(arraylike)
      expect(clone).to.deep.equal(arraylike)
      expect(clone).to.have.length(1)
    })
    it('throws on non-array likes', () => {
      for (const badValue of NON_ARRAY_LIKES)
        expect(() => pop(badValue)).to.throw('called on an array-like')
    })

  })

  Test.optionallyBindableMethod(shift, shift => {

    it('does not mutate original array', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const array2 = array::copy()
      const clone = shift(array2)

      // proves unique did not mutate array
      expect(array2).to.deep.equal(array)

      // proves output is not same as input
      expect(clone).to.not.equal(array)
    })
    it('same behaviour as Array.prototype.shift', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const clone = shift(array)
      array.shift()
      expect(clone).to.deep.equal(array)
    })
    it('works on array-likes', () => {
      const arraylike = { 0: 'zero', 1: 'one', length: 2 }

      const clone = shift(arraylike)
      arraylike::Array.prototype.shift()

      expect(clone).to.not.equal(arraylike)
      expect(clone).to.deep.equal(arraylike)
      expect(clone).to.have.length(1)
    })
    it('throws on non-array likes', () => {
      for (const badValue of NON_ARRAY_LIKES)
        expect(() => shift(badValue)).to.throw('called on an array-like')
    })
  })

  Test.optionallyBindableMethod(unshift, unshift => {

    it('does not mutate original array', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const array2 = array::copy()
      const clone = unshift(array2, -1)

      // proves unique did not mutate array
      expect(array2).to.deep.equal(array)

      // proves output is not same as input
      expect(clone).to.not.equal(array)
    })
    it('same behaviour as Array.prototype.unshift', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const clone = unshift(array, -1)
      array.unshift(-1)
      expect(clone).to.deep.equal(array)
    })
    it('works on array-likes', () => {
      const arraylike = { 0: 'zero', 1: 'one', length: 2 }

      const clone = unshift(arraylike, 'minus-one')
      arraylike::Array.prototype.unshift('minus-one')

      expect(clone).to.not.equal(arraylike)
      expect(clone).to.deep.equal(arraylike)
      expect(clone).to.have.length(3)
    })
    it('throws on non-array likes', () => {
      for (const badValue of NON_ARRAY_LIKES)
        expect(() => unshift(badValue)).to.throw('called on an array-like')
    })

  })

  Test.optionallyBindableMethod(splice, splice => {

    it('does not mutate original array', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const array2 = array::copy()
      const clone = splice(array2, 2, 1)

      // proves unique did not mutate array
      expect(array2).to.deep.equal(array)

      // proves output is not same as input
      expect(clone).to.not.equal(array)
    })
    it('same behaviour as Array.prototype.splice', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const clone = splice(array, 2, 1)
      array.splice(2, 1)
      expect(clone).to.deep.equal(array)
    })
    it('works on array-likes', () => {
      const arraylike = { 0: 'zero', 1: 'one', length: 2 }

      const clone = splice(arraylike, 0, 0, 'one-point-five')
      arraylike::Array.prototype.splice(0, 0, 'one-point-five')

      expect(clone).to.not.equal(arraylike)
      expect(clone).to.deep.equal(arraylike)
      expect(clone).to.have.length(3)
    })
    it('throws on non-array likes', () => {
      for (const badValue of NON_ARRAY_LIKES)
        expect(() => splice(badValue)).to.throw('called on an array-like')
    })

  })

  Test.optionallyBindableMethod(reverse, reverse => {

    it('does not mutate original array', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const array2 = array::copy()
      const clone = reverse(array2)

      // proves unique did not mutate array
      expect(array2).to.deep.equal(array)

      // proves output is not same as input
      expect(clone).to.not.equal(array)
    })
    it('same behaviour as Array.prototype.reverse', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const clone = reverse(array)
      array.reverse()
      expect(clone).to.deep.equal(array)
    })
    it('works on array-likes', () => {
      const arraylike = { 0: 'zero', 1: 'one', length: 2 }

      const clone = reverse(arraylike)
      arraylike::Array.prototype.reverse()

      expect(clone).to.not.equal(arraylike)
      expect(clone).to.deep.equal(arraylike)
      expect(clone).to.have.length(2)
    })
    it('throws on non-array likes', () => {
      for (const badValue of NON_ARRAY_LIKES)
        expect(() => reverse(badValue)).to.throw('called on an array-like')
    })

  })

  Test.optionallyBindableMethod(sort, sort => {

    it('does not mutate original array', () => {
      const array = [ 1, 0, 4, 2, 5, 3 ]
      const array2 = array::copy()
      const clone = reverse(array2)

      // proves unique did not mutate array
      expect(array2).to.deep.equal(array)

      // proves output is not same as input
      expect(clone).to.not.equal(array)
    })

    it('same behaviour as Array.prototype.sort', () => {
      const array = [ 1, 0, 4, 2, 5, 3 ]
      const clone = sort(array)
      array.sort()
      expect(clone).to.deep.equal(array)
    })

    it('works on array-likes', () => {
      const arraylike = { 0: 'base', 1: 'ace', length: 2 }

      const clone = sort(arraylike)
      arraylike::Array.prototype.sort()

      expect(clone).to.not.equal(arraylike)
      expect(clone).to.deep.equal(arraylike)
      expect(clone).to.have.length(2)
    })

    it('throws on non-array likes', () => {
      for (const badValue of NON_ARRAY_LIKES)
        expect(() => sort(badValue)).to.throw('called on an array-like')
    })

  })

  Test.optionallyBindableMethod(shuffle, shuffle => {

    it('does not mutate original array', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const array2 = array::copy()
      const clone = shuffle(array2)

      // proves unique did not mutate array
      expect(array2).to.deep.equal(array)

      // proves output is not same as input
      expect(clone).to.not.equal(array)
    })

    it('same behaviour as @benzed/array/shuffle', () => {
      const array = [ 0, 1, 2, 3, 4, 5 ]
      const clone = shuffle(array)
      shuffle(array)
      expect(clone.every(v => array.includes(v))).to.be.equal(true)
      expect(clone.length).to.be.equal(array.length)
    })

    it('works on array-likes', () => {

      const arraylike = {
        0: 'base',
        1: 'ace',
        length: 2
      }

      const clone = shuffle(arraylike)
      shuffle(arraylike)

      expect(clone).to.not.equal(arraylike)
      expect(clone.length).to.be.equal(arraylike.length)
    })

    it('throws on non-array-like values', () => {
      for (const badValue of NON_ARRAY_LIKES)
        if (typeof badValue !== 'string')
          expect(() => shuffle(badValue)).to.throw('called on a value with numeric length')
    })
  })

  Test.optionallyBindableMethod(unique, unique => {

    it('outputs a copy of the input with non-duplicated values', () => {
      const array = [ 0, 0, 0, 1, 1, 1 ]
      const array2 = array::copy()
      const clone = unique(array2)

      // proves unique did not mutate array
      expect(array2).to.deep.equal(array)

      // proves output is not same as input
      expect(clone).to.not.equal(array)
    })

    describe('outputs a copy of the input with non-value-equal values', () => {

      const primitives = [ 0, -0, 1, 1, 'string', 'string', true, true, false, false ]
      const pResults = [0, 1, 'string', true, false]

      it('works on primitives', () => {
        expect(unique(primitives)).to.deep.equal(pResults)
      })

      const foo = { foo: 'bar' }
      const baz = { foo: 'baz' }
      const cake1 = { cake: { town: true } }
      const cake2 = { cake: { town: false } }

      const objects = [ cake2, foo, baz, cake1, foo, cake1, baz, cake2 ]

      it('works on plain objects', () => {
        expect(unique(objects)).to.deep.equal([ cake2, foo, baz, cake1 ])
      })

      class Foo {
        constructor (bar) {
          this.bar = bar
        }
        equals (b) {
          return b.bar === this.bar
        }
      }

      const foos = primitives.map(p => new Foo(p))

      it('works on objects with $$equals method', () => {
        expect(unique(foos).map(f => f.bar)).to.deep.equal(pResults)
      })

      class UltraFoo extends Foo {
        [$$equals] = Foo.prototype.equals
      }

      const ultrafoos = primitives.map(p => new UltraFoo(p))

      it('works on objects with \'equals\' method', () => {
        expect(unique(ultrafoos).map(f => f.bar)).to.deep.equal(pResults)
      })
    })

    it('does not mutate original array', () => {
      const array = [ 0, 0, 0, 1, 1, 1 ]
      const array2 = array::copy()

      const clone = unique(array)

      // proves unique did not mutate array
      expect(array2).to.deep.equal(array)

      // proves output is not same as input
      expect(clone).to.not.equal(array)
    })

    it('works on array-likes', () => {

      const arraylike = {
        0: 'base',
        1: 'ace',
        length: 2
      }

      const clone = unique(arraylike)

      expect(clone).to.not.equal(arraylike)
      expect(clone.length).to.be.equal(arraylike.length)
    })

    it('throws on non-numeric-length values', () => {
      for (const badValue of NON_ARRAY_LIKES)
        if (typeof badValue !== 'string')
          expect(() => unique(badValue)).to.throw('called on an array-like object')
    })
  })

})
