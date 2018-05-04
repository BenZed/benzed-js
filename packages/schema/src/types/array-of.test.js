import { expect } from 'chai'

import bool from './bool'
import number from './number'
import arrayOf from './array-of'
import oneOfType from './one-of-type'

import { Context } from '../util'

import { expectResolve, expectReject } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('arrayOf()', () => {

  const arrayOfNumber = arrayOf(Number)

  const arrayOfBool = arrayOf(bool)

  it('errors if value cannot be cast to an Array of type', () => {
    expect(arrayOfNumber([ 1, 2, 3, 'nerd' ], new Context()))
      .to.have.property('message', 'Must be an Array of Number')
  })

  it('returns input, otherwise', () => {
    expect(arrayOfNumber([ 1, 2, 3 ], new Context()))
      .to.be.deep.equal([ 1, 2, 3 ])
  })

  it('casts input to array', () => {
    expect(arrayOfNumber(1, new Context()))
      .to.deep.equal([1])
  })

  it('can take other type functions', () => {
    expect(arrayOfBool([ true, false ], new Context()))
      .to.deep.equal([ true, false ])
  })

  it('type functions throw proper default errors', () => {
    expect(arrayOfBool([ 100 ], new Context()))
      .to.have.property('message', 'Must be an Array of Boolean')
  })

  it.only('uses cast functions defined by other type functions', () => {

    // const arrayOfNum = arrayOf(number)
    // expect(arrayOfNum([ '0', '1', '2' ], new Context()))
    //   .to.deep.equal([ 0, 1, 2 ])

    const arrayOfBoolOrNumber = arrayOf(oneOfType(bool, number))

    expect(arrayOfBoolOrNumber(['0', 'true'], new Context()))
      .to.deep.equal([0, true])
  })

  it('cast function in config overrides type cast functions, if provided', () => {

    const cast = value => value === 'ONE THOUSAND' ? 1000 : value

    const arrayOfNumber = arrayOf({ type: number, cast })

    expect(arrayOfNumber('ONE THOUSAND', new Context()))
      .to.deep.equal([ 1000 ])
  })

  describe('takes a configuration', () => {

    describe('type', () => {

      it('determines the type of items in the array', () => {
        const arrayOfString = arrayOf(String)

        const oneTwoThree = ['one', 'two', 'three']
        expect(arrayOfString(oneTwoThree, new Context())).to.deep.equal(oneTwoThree)
      })

    })

    describe('err', () => {

      it('custom error message if value could not be cast to an array', () => {

        const arrayOfString = arrayOf(String, 'May only use strings.')
        expect(arrayOfString([1, 2, 3], new Context()))
          .to.have.property('message', 'May only use strings.')
      })

    })

    describe('validators', () => {

      it('validators to be run on the array before items inside of it', () => {

        const even = arr => arr.length % 2 === 0
          ? arr
          : new Error('Array must have an even length.')

        const evenArrayOfNumbers = arrayOf(Number, even)

        const nums = [0, 1, 2, 3]
        expect(evenArrayOfNumbers(nums, new Context()))
          .to.deep.equal(nums)

        expect(evenArrayOfNumbers([1, 2, 3], new Context()))
          .to.have.property('message', 'Array must have an even length.')
      })

      it('validators can be asyncronous', () => {

        const delay = arr => Promise.resolve(arr)
        const delayArrayOfNum = arrayOf(Number, delay)

        return delayArrayOfNum([1, 2, 3, 4], new Context())::expectResolve([1, 2, 3, 4])
      })

      it('resolves item promises', async () => {

        const delayDouble = num => Promise.resolve(num * 2)
        const delayDoubleNum = number(delayDouble)

        await delayDoubleNum(5)::expectResolve(10)
        const delayArrayOfDelayNum = arrayOf(delayDoubleNum)

        await delayArrayOfDelayNum([1, 2, 3, 4], new Context())::expectResolve([2, 4, 6, 8])

        const delayWrong = num => Promise.resolve(`one-${num}`)
        const arrayOfDelayWrongNum = arrayOf(number(delayWrong))

        await arrayOfDelayWrongNum([1, 2, 3, 4], new Context())
          ::expectResolve(er => er.have.property('message', 'Must be an Array of Number'))

      })

    })

  })

})
