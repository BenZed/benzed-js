import { expect } from 'chai'
import { fromCamelCase } from '../src'
import Test from '@benzed/dev'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(fromCamelCase, fromCamelCase => {

  describe('dashCases a string', () => {
    const tests = [
      { in: 'whatever', out: 'whatever' },
      { in: 'a', out: 'a' },
      { in: 'aceOfBase', out: 'ace-of-base' },
      { in: 'oneTwoThree', out: 'one-two-three' },
      { in: 'foOBar', out: 'fo-o-bar' }
    ]

    for (const test of tests)
      it(`${test.in} => ${test.out}`, () => {
        expect(fromCamelCase(test.in)).to.equal(test.out)
      })
  })

  describe('joiner argument', () => {

    describe(`changes default joiner (from '-' to ' ' in this case)`, () => {

      const tests = [
        { in: 'whatYouLookinAt', out: 'what you lookin at' },
        { in: 'chickAndBeansBaby', out: 'chick and beans baby' },
        { in: 'iAmNOTACrook', out: 'i am n o t a crook' },
        { in: '1234w0pA', out: '1234w0p a' },
        { in: 'muscle-mania', out: 'muscle-mania' }
      ]

      for (const test of tests)
        it(`${test.in} => ${test.out}`, () => {
          expect(fromCamelCase(test.in, ' ')).to.equal(test.out)
        })
    })
  })
})
