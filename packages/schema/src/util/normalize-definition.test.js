import { expect } from 'chai'
import { inspect } from 'util'
import { copy } from '@benzed/immutable'

import normalize from './normalize-definition'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const SIMPLE_OBJ = {
  name: String
}

const SIMPLE_ARR = [ String ]

describe('normalize()', () => {

  it('can be a plain object', () => {
    expect(() => normalize(SIMPLE_OBJ)).to.not.throw(Error)
  })

  it('can be an array', () => {
    expect(() => normalize(SIMPLE_ARR)).to.not.throw(Error)
  })

  it('does not mutate input', () => {
    const input = copy(SIMPLE_OBJ)
    const inputOut = normalize(input)
    expect(input).to.not.equal(inputOut)
    expect(input).to.deep.equal(SIMPLE_OBJ)
  })

  describe('throws if incorrect type', () => {

    const badValues = [
      null, undefined, true, false, 'string', NaN, Infinity,
      Array, new function () {}(), function () {}, 10, -10, 0, 1
    ]

    for (const badValue of badValues)
      it(`${inspect(badValue)}`, () => {
        expect(() => normalize(badValue)).to.throw('must be a plain object or array')
      })
  })

})
