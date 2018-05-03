import { expect } from 'chai'

import bool from './bool'
import number from './number'
import arrayOf from './array-of'
import oneOfType from './one-of-type'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('arrayOf()', () => {

  const arrayOfNumber = arrayOf(Number)

  const arrayOfBool = arrayOf(bool)

  it('returns an error if value cannot be cast to an Array of type', () => {
    expect(arrayOfNumber([ 1, 2, 3, 'nerd' ]))
      .to.have.property('message', 'Must be an Array of Numbers')
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
      .to.have.property('message', 'Must be an Array of Booleans')
  })

  it('uses cast functions defined by other type functions', () => {

    const arrayOfNum = arrayOf(number)
    expect(arrayOfNum([ '0', '1', '2' ]))
      .to.deep.equal([ 0, 1, 2 ])

    const arrayOfBoolOrNumber = arrayOf(oneOfType(bool, number))

    expect(arrayOfBoolOrNumber(['0', 'true']))
      .to.deep.equal([0, true])

  })

  it('cast function in config overrides type cast functions, if provided', () => {

    const cast = value => value === 'ONE THOUSAND' ? 1000 : value

    const arrayOfNumber = arrayOf(number, cast)

    expect(arrayOfNumber('ONE THOUSAND'))
      .to.deep.equal([ 1000 ])

  })

})
