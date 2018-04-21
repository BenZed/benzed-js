import { expect } from 'chai'
import { inspect } from 'util'
import {
  isArrayLike as _isArrayLike,
  hasNumericLength as _hasNumericalLength
} from './is-array-like'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

import Test from '@benzed/dev'

/******************************************************************************/
// DATA
/******************************************************************************/

class CustomTypeWithLength {
  length = 5
}

class CustomTypeWithoutLength {

  * [Symbol.iterator] () {
    for (let i = 0; i < this.size; i++)
      yield i
  }

  size = 5

}

const ARRAY_LIKES = [
  [1, 2, 3],
  { length: 0 },
  new Int8Array(5),
  Buffer.alloc(5, 64),
  new String('foobar'), // eslint-disable-line
  new CustomTypeWithLength()
]

const NUMERICAL_LENGTH_VALUES = [
  ...ARRAY_LIKES,
  'foobar'
]

const ARRAY_UNLIKES = [
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

/******************************************************************************/
// Tests
/******************************************************************************/

Test.optionallyBindableMethod(_isArrayLike, isArrayLike => {

  describe('returns true if an object is array-like', function () {

    for (const value of [ ...ARRAY_LIKES, arguments ])
      it(
        `${value === arguments ? '<arguments>' : inspect(value)} is array-like`,
        () => expect(isArrayLike(value)).to.be.true
      )

  })

  describe('returns false if object is not an arraylike', () => {

    for (const value of [ ...ARRAY_UNLIKES, 'foobar' ])
      it(
        `${inspect(value)} is not array-like`,
        () => expect(isArrayLike(value)).to.be.false
      )
  })

})

Test.optionallyBindableMethod(_hasNumericalLength, hasNumericLength => {

  describe('returns true if an object has numeric length', function () {
    for (const value of [ ...NUMERICAL_LENGTH_VALUES, arguments ])
      it(
        `${value === arguments ? '<arguments>' : inspect(value)} has numeric length`,
        () => expect(hasNumericLength(value)).to.be.true
      )
  })

  describe('returns false if object does not have a numeric length', () => {
    for (const value of ARRAY_UNLIKES)
      it(
        `${inspect(value)} does not have numeric length`,
        () => expect(hasNumericLength(value)).to.be.false
      )
  })

})
