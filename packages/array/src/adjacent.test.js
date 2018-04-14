import { expect } from 'chai'

import _adjacent from './adjacent'
import Test from '@benzed/test'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(_adjacent, adjacent => {

  const array = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

  it('returns an adjacent value of a given value and array', () => {
    expect(adjacent(array, 'b')).to.equal('c')
  })

  it('adjacent value wraps around to the beginning if out of range', () => {
    expect(adjacent(array, 'g')).to.equal('a')
  })

  it('returns first value in array if given value couldn\'t be found', () => {
    expect(adjacent(array, '1')).to.equal('a')
  })

  it('works on numerical-length values', () => {
    const arrayLike = { length: 2, 0: 'a', 1: 'b' }

    expect(adjacent(arrayLike, 'b')).to.equal('a')
    expect(adjacent('string', 'r')).to.equal('i')
  })

  it('alternatively takes a delta argument', () => {
    expect(adjacent(array, 'a', 2)).to.equal('c')
  })

  it('delta argument can be reverse', () => {
    expect(adjacent(array, 'b', -3)).to.equal('f')
  })

})
