import { expect } from 'chai'
import { capitalize } from '../src'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const syntax = {
  argument: a => capitalize(a),
  bound: a => a::capitalize()
}

describe('capitalize()', () => {

  for (const method in syntax) {

    const func = syntax[method]

    describe(`${method} syntax:`, () => {

      describe('capitalizes strings', () => {

        const tests = [
          { in: 'whatever', out: 'Whatever' },
          { in: 'a', out: 'A' },
          { in: 'ace of base', out: 'Ace of base' },
          { in: '1twothree', out: '1twothree' },
          { in: 'foobar', out: 'Foobar' }
        ]

        for (const test of tests)
          it(`${test.in} => ${test.out}`, () => {
            expect(func(test.in)).to.equal(test.out)
          })

      })

    })

  }

})
