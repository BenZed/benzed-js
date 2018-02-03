import { expect } from 'chai'
import { shuffle } from '../src'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

// Because shuffle could theoretically break tests do to it's random nature,
// We run each test a 10000 times. If less than 99% of these 10000 tests pass,
// something is wrong.

function dechancify (doFunc, testFunc) {

  const MAX = 10000
  const THRESHOLD = MAX * 0.99

  let passes = 0
  for (let i = 0; i < MAX; i++) {
    const result = doFunc()
    try {
      testFunc(result)
      passes++
    } catch (err) { }
  }

  expect(passes).to.be.at.least(THRESHOLD)
}

describe('shuffle()', function () {

  this.slow(1000)

  const array = [ 0, 1, 2, 3, 4, 5, 6 ]

  it('randomly orders an array', () => {
    dechancify(
      () => shuffle([...array]),
      result => expect(result).to.not.deep.equal(array)
    )
  })

  it('works on array-likes', () => {
    const arrayLike = {
      length: 6,
      0: 'a',
      1: 'b',
      2: 'c',
      3: 'd',
      4: 'e',
      5: 'f'
    }

    dechancify(
      () => shuffle({...arrayLike}),
      result => expect(result).to.not.deep.equal(arrayLike)
    )
  })

  it('can be bound', () => {
    dechancify(
      () => [...array]::shuffle(),
      result => expect(result).to.not.deep.equal(array)
    )
  })

  it('returns input', () => {
    expect(shuffle(array)).to.equal(array)
  })

  it('work on buffers', () => {
    const buffer = Buffer.from(array)
    expect(buffer::shuffle).to.not.throw()
  })

})
