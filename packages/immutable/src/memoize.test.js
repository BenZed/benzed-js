import { expect } from 'chai'
import { Test } from '@benzed/dev'
import memoize from './memoize'
import { primes } from '@benzed/math'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod.only(memoize, memoize => {

  let add
  let memoizedAdd
  let addCalls = 0

  before(() => {
    add = (a, b) => {
      addCalls++
      return a + b
    }
    memoizedAdd = memoize(add)
  })

  it('returns a function', () => {
    expect(memoizedAdd).to.be.instanceof(Function)
  })

  it('returns cached result if arguments are value equal', () => {
    expect(memoizedAdd(3, 7)).to.be.equal(10)
    expect(addCalls).to.be.equal(1)

    expect(memoizedAdd(3, 7)).to.be.equal(10)
    expect(addCalls).to.be.equal(1)

    expect(memoizedAdd(5, 5)).to.be.equal(10)
    expect(addCalls).to.be.equal(2)
  })

  // it('memoized isPrime', () => {
  //   const nonGenPrimes = (min, max) => [ ...primes(min, max) ]
  //   const memoizedNonGenPrimes = memoize(nonGenPrimes)
  //
  //   memoizedNonGenPrimes(2, 100000)
  //   memoizedNonGenPrimes(2, 100000)
  // })

  it('addSubtract', () => {
    function addSubtract (input) {

      const state = this

      const sign = state
        ? state.sign * -1
        : -1

      const value = state
        ? state.value + (input * sign)
        : input

      const nextAddSubtract = addSubtract.bind({ sign, value })

      nextAddSubtract.valueOf = () => value

      return nextAddSubtract
    }
    expect(+addSubtract(1)(2)(3)).to.be.equal(0)
  })

})
