import { expect } from 'chai'
import { isArrayLike, hasNumericLength } from '../src'
import { inspect } from 'util'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('isArrayLike()', () => {

  describe('hasNumericLength is an alias', () =>
    expect(hasNumericLength).to.be.equal(isArrayLike)
  )

  describe('returns true if an object is array-like', function () {

    class CustomTypeWithLength {
      length = 5
    }

    const objs = [
      [1, 2, 3],
      'string',
      { length: 0 },
      new Int8Array(5),
      Buffer.alloc(5, 64),
      arguments,
      new CustomTypeWithLength()
    ]

    for (const obj of objs)
      it(
        `${obj === arguments ? '<arguments>' : inspect(obj)} is array-like`,
        () => expect(isArrayLike(obj)).to.be.true
      )

  })

  describe('returns false if object is not an arraylike', () => {

    class CustomTypeWithoutLength {

      * [Symbol.iterator] () {
        for (let i = 0; i < this.size; i++)
          yield i
      }

      size = 5

    }

    const objs = [
      new Date(),
      /length-regex/g,
      5,
      true,
      Symbol('symbols-arn\'t-array-like'),
      { size: 10 },
      new Map(),
      new Set(),
      new CustomTypeWithoutLength()
    ]

    for (const obj of objs)
      it(
        `${inspect(obj)} is not array-like`,
        () => expect(isArrayLike(obj)).to.be.false
      )

  })

  it('Can be bound', () => {
    expect([]::isArrayLike()).to.be.equal(true)
    expect({}::isArrayLike()).to.be.equal(false)
    expect(null::isArrayLike()).to.be.equal(false)
  })
})
