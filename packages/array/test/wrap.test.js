import { expect } from 'chai'
import { wrap, unwrap } from '../src'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('wrap', () => {

  it('ensures an input is an array', () => {

    expect(wrap(5)).to.be.instanceof(Array)
    expect(wrap(5)).to.be.deep.equal([5])
  })

  it('returns the input if it is an array', () => {

    const arr = [ 1 ]

    expect(wrap(arr)).to.be.equal(arr)
  })

  it('can be bound', () => {

    const obj = {}
    const arr = [1, 2, 3, 4, 5]

    expect(obj::wrap()).to.be.deep.equal(wrap(obj))
    expect(arr::wrap()).to.be.equal(wrap(arr))
  })

})

describe('unwrap', () => {

  it('ensures an input is not an array', () => {

    const obj = {}

    expect(unwrap([obj])).to.be.equal(obj)
  })

  it('returns the input if it is not an array', () => {

    const obj = {}

    expect(unwrap(obj)).to.be.equal(obj)
  })

  it('can be bound', () => {

    const obj = {}
    const arr = [1, 2, 3, 4, 5]

    expect(obj::unwrap()).to.be.deep.equal(unwrap(obj))
    expect(arr::unwrap()).to.be.equal(unwrap(arr))
  })

})
