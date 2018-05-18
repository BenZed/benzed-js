import { expect } from 'chai'
import { capitalize } from '../src'
import Test from '@benzed/dev'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(capitalize, capitalize => {

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
        expect(capitalize(test.in)).to.equal(test.out)
      })
  })

})
