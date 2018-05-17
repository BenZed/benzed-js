import { expect } from 'chai'

import bool from './bool'
import number from './number'
import arrayOf from './array-of'
// import oneOfType from './one-of-type'

import Context from '../util/context'

import { expectResolve } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('arrayOf()', () => {

  const arrayOfNumber = arrayOf(Number)

  const arrayOfBool = arrayOf(bool)

  it('errors if value cannot be cast to an Array of type', () => {
    expect(arrayOfNumber([ 1, 2, 3, 'nerd' ]))
      .to.have.property('message', 'Must be an Array of Number')
  })

  it('returns input, otherwise', () => {
    expect(arrayOfNumber([ 1, 2, 3 ]))
      .to.be.deep.equal([ 1, 2, 3 ])
  })

  it('casts input to array', () => {
    expect(arrayOfNumber(1))
      .to.deep.equal([1])
  })

  it('can take other type functions', () => {
    expect(arrayOfBool([ true, false ]))
      .to.deep.equal([ true, false ])
  })

  it('type functions throw proper default errors', () => {
    expect(arrayOfBool([ 100 ]))
      .to.have.property('message', 'Must be an Array of Boolean')
  })

  describe('takes a configuration', () => {

    describe('type', () => {

      it('determines the type of items in the array', () => {
        const arrayOfString = arrayOf(String)

        const oneTwoThree = ['one', 'two', 'three']
        expect(arrayOfString(oneTwoThree))
          .to.deep.equal(oneTwoThree)
      })

      describe('can take type functions', () => {

        it('bool example', () => {
          const arrayOfBool = arrayOf(bool)

          const trueFalseTrue = [ 'true', 'false', 'true' ]
          expect(arrayOfBool(trueFalseTrue))
            .to.deep.equal(trueFalseTrue)

          const bad = [ -1000, 'faslle' ]
          expect(arrayOfBool(bad))
            .to.have.property('message', 'Must be an Array of Boolean')
        })

        it.skip('oneOfType example', () => {

          const arrayOfBoolOrNumber = arrayOf(
            oneOfType(bool, number)
          )

          const mixedBoolNum = [ 2, true, false, 100 ]
          expect(arrayOfBoolOrNumber(mixedBoolNum))
            .to.deep.equal([ 2, true, false, 100 ])

        })

      })

    })

    describe('err', () => {

      it('custom error message if value could not be cast to an array', () => {

        const arrayOfString = arrayOf(String, 'May only use strings.')
        expect(arrayOfString([1, 2, 3]))
          .to.have.property('message', 'May only use strings.')
      })

    })

    describe('validators', () => {

      it('validators to be run on the array after items inside of it', () => {

        const even = arr => arr.length % 2 === 0
          ? arr
          : new Error('Array must have an even length.')

        const evenArrayOfNumbers = arrayOf(Number, even)

        const nums = [0, 1, 2, 3]
        expect(evenArrayOfNumbers(nums))
          .to.deep.equal(nums)

        expect(evenArrayOfNumbers([1, 2, 3]))
          .to.have.property('message', 'Array must have an even length.')
      })

      it('validators can be asyncronous', () => {

        const delay = arr => Promise.resolve(arr)
        const delayArrayOfNum = arrayOf(Number, delay)

        return delayArrayOfNum([1, 2, 3, 4])::expectResolve([1, 2, 3, 4])
      })

      it('resolves item promises', async () => {

        const delayDouble = num => Promise.resolve(num * 2)
        const delayDoubleNum = number(delayDouble)

        await delayDoubleNum(5)::expectResolve(10)
        const delayArrayOfDelayNum = arrayOf(delayDoubleNum)

        await delayArrayOfDelayNum([1, 2, 3, 4])::expectResolve([2, 4, 6, 8])

        const delayWrong = num => Promise.reject(new Error('This number... broke, or something.'))
        const arrayOfDelayWrongNum = arrayOf(number(delayWrong))

        await arrayOfDelayWrongNum([1, 2, 3, 4])
          ::expectResolve(er => er.have.property('message', 'This number... broke, or something.'))

      })
    })
  })
})
