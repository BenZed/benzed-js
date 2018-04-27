import { expect } from 'chai'
import pluck from './pluck'

import { Test } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod.only(pluck, pluck => {

  const arr = [ 1, 2, 3, 4, 5, 6, 7, 8 ]
  let even
  before(() => {
    even = pluck(arr, n => n % 2 === 0)
  })

  it('removes results from an array that pass a test', () => {
    expect(arr).to.deep.equal([1, 3, 5, 7])
  })

  it('returns results to new array', () => {
    expect(even).to.deep.equal([2, 4, 6, 8])
  })

  it('callback takes value, index, array args', () => {
    const arr = [ 'zero' ]

    pluck(arr, (v, i, a) => {
      expect(v).to.equal('zero')
      expect(i).to.equal(0)
      expect(a).to.equal(arr)
    })
  })

  describe('count', () => {

    it('limits the number of results to take', () => {

      const arr = [ 'one', 'two', 'three', 'four' ]

      const firstShort = pluck(arr, word => word.length <= 3, 1)

      expect(arr).to.have.length(3)
      expect(arr).to.deep.equal(['two', 'three', 'four'])
      expect(firstShort).to.deep.equal(['one'])

    })

    it('negative numbers take last results', () => {

      const arr = [ 11, 2, 3, 4, 5, 6, 7, 8, 19, 10 ]

      const lastTwoDoubleDigits = pluck(arr, n => n >= 10, -2)

      expect(arr).to.deep.equal([ 11, 2, 3, 4, 5, 6, 7, 8 ])
      expect(lastTwoDoubleDigits).to.deep.equal([ 19, 10 ])

    })

  })

})
