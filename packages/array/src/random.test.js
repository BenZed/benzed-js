import { assert, expect } from 'chai'
import { Test } from '@benzed/dev'
import random from './random'
import { equals } from '@benzed/immutable'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

function expectEqualOccurances (input, values, count = values.length * 5000) {

  const random = this

  const results = []
  for (let i = 0; i < count; i++)
    results.push(random(input))

  const average = count / values.length
  const slop = count * 0.01

  for (const value of values) {
    const occurances = results
      .reduce((c, v) => equals(v, value)
        ? c + 1
        : c,
      0)

    assert(
      occurances >= average - slop && occurances <= average + slop,
      `${value} should have been generated ${average} +- ${slop} times: ${occurances}`
    )
  }

}

Test.optionallyBindableMethod(random, random => {

  it('gives a random element in an array', () => {

    const arr = [ 'zero', 'one', 'two', 'three', 'four' ]

    random::expectEqualOccurances(arr, arr)
  })

  it('gives a random element in a strings', () => {
    const str = '~!@#$%^&*()'
    random::expectEqualOccurances(str, str.split(''))
  })

  it('gives a random element of an array-like', () => {
    const arrlike = {
      length: 5,
      0: 'a',
      1: 100,
      2: { truth: false },
      3: { falsy: true },
      4: [ 'onomatapeia' ]
    }
    random::expectEqualOccurances(arrlike, Array.from(arrlike))
  })

  it('gives a random element in a set', () => {
    const set = new Set([0, 1, 2, 3, 4, 5, 6])
    random::expectEqualOccurances(set, [ ...set ])
  })

  it('gives a random element in a map', () => {
    const map = new Map([['one', 1], ['two', 2], ['three', 3], ['four', 4]])
    random::expectEqualOccurances(map, [ ...map ])
  })

  it('returns undefined on empty arrays', () => {
    expect(random([])).to.be.equal(undefined)
  })

  it('throws if given invalid input', () => {
    for (const bad of [ 0, true, false, {}, Symbol('hey') ])
      expect(() => random(bad)).to.throw('input must be an array-like or iterable')
  })

})
