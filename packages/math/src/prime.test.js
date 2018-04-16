import { assert } from 'chai'
import { isPrime, primes } from './prime'

/* global describe it */

describe('isPrime($value)', () => {

  it('returns true if a number is prime, false otherwise', () => {

    const primes = [ 2, 3, 5, 7, 11, 13, 17 ]
    const subs = [ 1, 4, 6, 8, 9, 10, 12, 14, 15, 16 ]

    for (const prime of primes)
      assert.equal(isPrime(prime), true, `${prime} should be prime`)

    for (const sub of subs)
      assert.equal(isPrime(sub), false, `${sub} should not be prime`)

  })

  it('can be bound:\t\t\t\t\t5::isPrime()', () => {
    assert(5::isPrime(), '5 should be prime')
  })

})

describe('*primes($max) -or- *primes($min, $max)', () => {

  it('generates primes: for (const prime of primes(20))', () => {
    for (const prime of primes(20))
      assert(prime::isPrime(), `${prime} is not prime`)
  })

  it('spreads into an array: [...primes(500,1000)]', () => {
    const arr = [...primes(500, 1000)]
    assert.equal(arr.length, 73)
  })

})
