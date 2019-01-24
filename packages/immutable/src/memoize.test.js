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

  it('no arguments is also considered value-equal', () => {
    const memoizedPrimes = memoize(() => [ ...primes(2, 50000) ])

    function time (...args) {
      const func = this
      const start = Date.now()
      func(...args)
      return Date.now() - start
    }

    const timedMemoizedPrimes = memoizedPrimes::time

    /* eslint-disable no-self-compare */
    assert(
      timedMemoizedPrimes() >
      timedMemoizedPrimes(),
      'memoizing did not speed up execution'
    )
  })

  it('works asyncronously', async () => {
    const getWaitTime = time => new Promise(resolve => setTimeout(() => resolve(time), time))

    const memoizedGetWaitTime = memoize(getWaitTime)

    let start = Date.now()
    let wait = await memoizedGetWaitTime(10)
    let time = Date.now() - start

    expect(wait).to.be.equal(10)
    expect(time).to.be.above(9)

    start = Date.now()
    wait = await memoizedGetWaitTime(10)
    time = Date.now() - start

    expect(wait).to.be.equal(10)
    // proves that awaiting didn't happen twice
    expect(time).to.be.below(9)

  })

  it('optionally takes a maxCacheSize argument', () => {
    let sideEffects = 0
    const returnOne = memoize(() => {
      sideEffects++
      return 1
    }, 1)

    expect(returnOne(0)).to.be.equal(1)
    expect(sideEffects).to.be.equal(1)

    // proves that function is using cached result, since no side sideEffect
    // is not being touched
    expect(returnOne(0)).to.be.equal(1)
    expect(sideEffects).to.be.equal(1)

    expect(returnOne(1)).to.be.equal(1)
    expect(sideEffects).to.be.equal(2)

    // even though 0 was once cached, it's result has been discarded, because the
    // max cache size is 1
    expect(returnOne(0)).to.be.equal(1)
    expect(sideEffects).to.be.equal(3)

  })

  it('returned function gets input function name + memoized', () => {

    function calculateResult () {}

    const memoized = memoize(calculateResult)

    expect(memoized).to.have.property('name', 'calculateResult memoized')
    expect(memoize(() => {})).to.have.property('name', '(anonymous) memoized')
  })

})
