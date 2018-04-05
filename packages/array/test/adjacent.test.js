import { expect } from 'chai'

import { adjacent } from '../src'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('adjacent()', () => {

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

  it('function can be bound', () => {
    expect(array::adjacent('c')).to.equal('d')
  })

  it('works on numerical-length values', () => {
    const arrayLike = { length: 2, 0: 'a', 1: 'b' }

    expect(arrayLike::adjacent('b')).to.equal('a')
    expect('string'::adjacent('r')).to.equal('i')
  })

  it('alternatively takes a delta argument', () => {
    expect(array::adjacent('a', 2)).to.equal('c')
  })

  it('delta argument can be reverse', () => {
    expect(array::adjacent('b', -3)).to.equal('f')
  })

})
