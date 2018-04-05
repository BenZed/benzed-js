import { expect } from 'chai'
import { toCamelCase } from '../src'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const syntax = {
  argument: (a, b) => toCamelCase(a, b),
  bound: (a, b) => a::toCamelCase(b)
}

describe('toCamelCase()', () => {

  for (const method in syntax) {

    const func = syntax[method]

    describe(`${method} syntax:`, () => {

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
            expect(func(test.in)).to.equal(test.out)
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
              expect(func(test.in, ' ')).to.equal(test.out)
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
              expect(func(test.in, '- ')).to.equal(test.out)
            })
        })

        describe(`can also take a RegExp: /@|-|\\./`, () => {

          const tests = [
            { in: 'some-body@gmail.com', out: 'someBodyGmailCom' },
            { in: 'see- @.saw', out: 'see Saw' }
          ]

          for (const test of tests)
            it(`${test.in} => ${test.out}`, () => {
              expect(func(test.in, /@|-|\./)).to.equal(test.out)
            })
        })

        it('throws if delimiter isnt string or regexp', () => {
          expect(() => func('what1ever', 1)).to.throw('string or RegExp')
        })
      })
    })
  }
})
