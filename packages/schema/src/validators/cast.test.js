import { expect } from 'chai'
import cast from './cast'
import { CAST } from '../util/symbols'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('cast()', () => {

  const double = n => n * 2
  const square = n => n * n

  const bracket = n => `[${n}]`
  const repeat = s => s.repeat(2)

  it('takes an input and runs it against a series of validators', () => {
    const fancyCast = cast(double, bracket, repeat)
    expect(fancyCast(10)).to.be.equal(`[20][20]`)
  })

  it('errors prevent series from continuing and returns error', () => {
    const error = () => new Error('BAD')

    const dangerCast = cast(square, error, repeat)

    expect(() => dangerCast(10)).to.not.throw(Error)
    expect(dangerCast(10)).to.be.instanceof(Error)
  })

  it('returned caster has CAST symbol', () => {

    const numberCast = cast(double, square)

    expect(numberCast).to.have.property(CAST, true)

  })

})
