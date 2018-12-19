import { assert, expect } from 'chai'
import { Test } from '@benzed/dev'
import memoize from './memoize'
import { primes } from '@benzed/math'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(memoize, memoize => {

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

  it('memoized isPrime', () => {
    const nonGenPrimes = (min, max) => [ ...primes(min, max) ]
    const memoizedNonGenPrimes = memoize(nonGenPrimes)

    function time (...args) {
      const func = this
      const start = Date.now()
      func(...args)
      return Date.now() - start
    }

    const timedMemoizedNonGenPrimes = memoizedNonGenPrimes::time

    /* eslint-disable no-self-compare */
    assert(
      timedMemoizedNonGenPrimes(2, 50000) >
      timedMemoizedNonGenPrimes(2, 50000),
      'memoizing did not speed up execution'
    )
  })

})
