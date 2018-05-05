import { expect } from 'chai'
import oneOfType from './one-of-type'
import arrayOf from './array-of'
import bool from './bool'
import number from './number'
import { Context } from '../util'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('oneOfType()', () => {

  const isBoolOrNumber = oneOfType(Boolean, Number)

  it('returns an error if input is not one of many types', () => {
    expect(isBoolOrNumber('lol', new Context()))
      .to.have.property('message', 'Must be either: Boolean or Number')
  })

  it('returns value otherwise', () => {
    expect(isBoolOrNumber(100, new Context()))
      .to.equal(100)

    expect(isBoolOrNumber(true, new Context()))
      .to.equal(true)
  })

  describe('takes a config', () => {
    const err = 'That\'s not a boolean or a number.'
    it('err string', () => {
      const boolOrNumWithError = oneOfType(Boolean, Number, err)
      expect(boolOrNumWithError(NaN, new Context()))
        .to.have.property('message', err)
    })
  })

  it('can be nested with other type functions', () => {

    const stringOrArrayOf = oneOfType(String, arrayOf(String))

    expect(stringOrArrayOf('str', new Context()))
      .to.be.equal('str')

    expect(stringOrArrayOf(['str'], new Context()))
      .to.deep.equal(['str'])

    expect(stringOrArrayOf([ 0 ], new Context()))
      .to.have.property('message', 'Must be either: String or Array of String')

    const arrayOfBoolsOrArrayOfNums = oneOfType(arrayOf(bool), arrayOf(number))

    expect(arrayOfBoolsOrArrayOfNums('no friggen way skin', new Context()))
      .to.have.property('message', 'Must be either: Array of Boolean or Array of Number')

  })

})
