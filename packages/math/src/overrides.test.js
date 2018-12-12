import { random, round, floor, ceil, max, min } from '../src'
import { assert, expect } from 'chai'
import Test from '@benzed/dev'

/* global describe it */

describe('overridden methods', () => {

  describe('random($min, $max, $alt)', function () {

    this.timeout(5000)

    it('creates random numbers between min negative and max positive value', () => {
      for (let i = 0; i < 100000; i++) {
        const result = random(-50, 50)
        assert(result >= -50 && result <= 50, `${result} out of range`)
      }
    })

    it('creates random numbers between min positive and max positive value', () => {
      for (let i = 0; i < 100000; i++) {
        const result = random(50, 150)
        assert(result >= 50 && result <= 150, `${result} out of range`)
      }
    })

    it('creates random numbers between min negative and max negative value', () => {
      for (let i = 0; i < 100000; i++) {
        const result = random(-150, -50)
        assert(result >= -150 && result <= -50, `${result} out of range`)
      }
    })

    it('third argument seed can be provided to seed a random number', () => {

      for (let seed = 0; seed < 100000; seed += 1) {
        const r1 = random(0, 10, seed)
        const r2 = random(0, 10, seed)
        assert(r1 >= 0 && r1 < 10, `${r1} out of range`)
        assert(r1 === r2, `${seed} should provide the same random values, got ${r1} and ${r2}`)
      }

    })

    it('seed arguments can be bound', () => {

      const seedCanBeBound = 100::random(0, 100) === 100::random(0, 100) // eslint-disable-line no-self-compare
      assert(seedCanBeBound, 'seed can\'t be bound')

    })

  });

  [ round, floor, ceil ].forEach(func => {
    Test.optionallyBindableMethod(func, func => {

      it(`${func.name} numbers by a specific place value`, () => {

        for (let place = 0.125; place < 10; place += 0.75)
          for (let i = 0; i < 10000; i++) {
            const result = func(random(0, 100), place)
            assert(result % place === 0, `${result} is not rounded to ${place}`)
          }
      })

      it('negative place values are treated as positive', () => {
        const neg = func(5.5, -2)
        const pos = func(5.5, 2)
        assert(neg === pos, `5.5 ${func.name}ed by -2 should be ${neg}, is ${pos}`)
      })

      it('0 place value has no effect', () => {
        const _in = 5.1234
        const out = func(_in, 0)
        assert(_in === out, `0 place value makes ${_in} === ${out}`)
      })

    })
  })

  class Role {

    constructor (name, worth) {
      this.name = name
      this.worth = worth
    }

    valueOf () {
      return this.worth
    }
  }

  const admin = new Role('admin', 3)
  const producer = new Role('producer', 2)
  const staff = new Role('staff', 1)
  const freelance = new Role('freelance', 0)

  for (const boundary of [ max, min ]) {

    const isMax = boundary === max

    describe(boundary.name + '(...params)', () => {

      it(`returns the ${isMax ? 'highest' : 'lowest'} value`, () => {
        const value = boundary(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
        expect(value).to.be.equal(isMax ? 10 : 1)
      })

      it(`returns ${isMax ? -Infinity : Infinity} by default`, () => {
        const value = boundary()
        expect(value).to.be.equal(isMax ? -Infinity : Infinity)
      })

      it('works on objects implementing valueOf', () => {
        expect(boundary(admin, producer, staff, freelance))
          .to.be.equal(isMax ? admin : freelance)
      })
    })
  }
})
