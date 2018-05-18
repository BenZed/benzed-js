import { expect } from 'chai'
import { toCamelCase } from '../src'
import Test from '@benzed/dev'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(toCamelCase, toCamelCase => {

  describe('camelCases a string', () => {
    const tests = [
      { in: 'whatever', out: 'whatever' },
      { in: 'a', out: 'a' },
      { in: 'ace-of-base', out: 'aceOfBase' },
      { in: 'one-two-three', out: 'oneTwoThree' },
      { in: 'foo--bar', out: 'fooBar' }
    ]

    for (const test of tests)
      it(`${test.in} => ${test.out}`, () => {
        expect(toCamelCase(test.in)).to.equal(test.out)
      })
  })

  describe('limiter argument', () => {

    describe(`changes default limiter (from '-' to ' ' in this case)`, () => {

      const tests = [
        { in: 'what  you  lookin  at', out: 'whatYouLookinAt' },
        { in: 'chick and beans baby', out: 'chickAndBeansBaby' },
        { in: 'i am NOT a crook', out: 'iAmNOTACrook' },
        { in: '1234w0p a', out: '1234w0pA' },
        { in: 'muscle-mania', out: 'muscle-mania' }
      ]

      for (const test of tests)
        it(`${test.in} => ${test.out}`, () => {
          expect(toCamelCase(test.in, ' ')).to.equal(test.out)
        })
    })

    describe(`multiple characters denote multiple delimiters (' -' will split on '-' or ' ')`, () => {

      const tests = [
        { in: 'which one of you sawm bees', out: 'whichOneOfYouSawmBees' },
        { in: 'node-jS', out: 'nodeJS' },
        { in: 'crackatoa', out: 'crackatoa' },
        { in: 'acher eiker-awber', out: 'acherEikerAwber' },
        { in: 'foo -bar', out: 'fooBar' }
      ]

      for (const test of tests)
        it(`${test.in} => ${test.out}`, () => {
          expect(toCamelCase(test.in, '- ')).to.equal(test.out)
        })
    })

    describe(`can also take a RegExp: /@|-|\\./`, () => {

      const tests = [
        { in: 'some-body@gmail.com', out: 'someBodyGmailCom' },
        { in: 'see- @.saw', out: 'see Saw' }
      ]

      for (const test of tests)
        it(`${test.in} => ${test.out}`, () => {
          expect(toCamelCase(test.in, /@|-|\./)).to.equal(test.out)
        })
    })

    it('throws if delimiter isnt string or regexp', () => {
      expect(() => toCamelCase('what1ever', 1)).to.throw('string or RegExp')
    })
  })
})
