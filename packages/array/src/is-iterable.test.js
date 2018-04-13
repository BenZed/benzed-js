import { expect } from 'chai'
import isIterable from './is-iterable'
import { inspect } from 'util'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('isIterable()', () => {

  describe('returns true if an object is iterable', function () {

    class CustomTypeWithIterator {

      * [Symbol.iterator] () {
        for (let i = 0; i < this.size; i++)
          yield i
      }

      size = 5

    }
    const objs = [
      [1, 2, 3],
      'string',
      new Int8Array(5),
      Buffer.alloc(5, 64),
      arguments,
      new Map(),
      new Set(),
      new CustomTypeWithIterator()
    ]

    for (const obj of objs)
      it(
        `${obj === arguments ? '<arguments>' : inspect(obj)} is iterable`,
        () => expect(isIterable(obj)).to.be.true
      )

  })

  describe('returns false if object is not iterable', () => {

    class CustomTypeWithoutIterator {

    }

    const objs = [
      new Date(),
      /length-regex/g,
      true,
      5,
      Symbol('symbols-arn\'t-array-like'),
      { size: 10 },
      new CustomTypeWithoutIterator()
    ]

    for (const obj of objs)
      it(
        `${inspect(obj)} is not iterable`,
        () => expect(isIterable(obj)).to.be.false
      )

  })

  it('Can be bound', () => {
    expect([]::isIterable()).to.be.equal(true)
    expect({}::isIterable()).to.be.equal(false)
    expect(null::isIterable()).to.be.equal(false)
  })
})
