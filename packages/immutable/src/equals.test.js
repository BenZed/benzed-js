import { expect } from 'chai'
import { equals, EQUALS } from '../src'

import { Test, inspect } from '@benzed/test'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(equals, equals => {

  describe('returns true if two operands are "value-equal"', () => {

    describe('works on primitives', () => {

      const SYMBOL = Symbol('c')

      const primitives = [
        [ -1, -1, true ],
        [ -1, 1, false ],
        [ Infinity, -Infinity, false ],
        [ -Infinity, -Infinity, true ],
        [ Infinity, Infinity, true ],
        [ true, true, true ],
        [ true, false, false ],
        [ false, false, true ],
        [ 'true', true, false ],
        [ null, null, true ],
        [ null, undefined, false ],
        [ undefined, undefined, true ],
        [ NaN, NaN, true ],
        [ Symbol('a'), Symbol('b'), false ],
        [ Symbol('c'), Symbol('c'), false ],
        [ SYMBOL, SYMBOL, true ],
        [ 'string', 'string', true ],
        [ 'string', 'long-string', false ]
      ]

      for (const [ a, b, output ] of primitives)
        it(inspect`${(a)} equals ${(b)} : ${output}`, () => {
          expect(equals(a, b)).to.equal(output)
        })
    })

    describe('works on arrays', () => {
      it('[1,2,3] equals [1,2,3]', () =>
        expect(equals([1, 2, 3], [1, 2, 3])).to.be.true
      )

      it('[1,2] not equal [1,2,3]', () =>
        expect(equals([1, 2], [1, 2, 3])).to.not.be.true
      )
    })

    describe('works on objects', () => {

      it('plain', () => {

        const obj1 = { foo: 'bar' }
        const obj2 = { foo: 'bar' }
        const obj3 = { foo: 'baz' }

        expect(equals(obj1, obj1)).to.be.equal(true)
        expect(equals(obj1, obj2)).to.be.equal(true)
        expect(equals(obj1, obj3)).to.be.equal(false)

      })

      it('implementing symbolic EQUALS', () => {

        let calls = 0

        class Foo {

          constructor (bar = 'bar') {
            this.bar = bar
          }

          [EQUALS] (b) {
            calls++
            return b instanceof Foo && b.bar === this.bar
          }
        }

        const foo1 = new Foo()
        const foo2 = new Foo()
        const foo3 = new Foo('baz')

        expect(equals(foo1, foo2)).to.be.equal(true)
        expect(equals(foo1, foo3)).to.be.equal(false)

        // calls should not increment, because objects are reference identical
        expect(equals(foo1, foo1)).to.be.equal(true)

        expect(calls).to.be.equal(2)

      })

      it('implementing string equals', () => {

        let calls = 0

        class Foo {

          constructor (bar = 'bar') {
            this.bar = bar
          }

          equals (b) {
            calls++
            return b instanceof Foo && b.bar === this.bar
          }

        }

        const foo1 = new Foo()
        const foo2 = new Foo()
        const foo3 = new Foo('baz')

        expect(equals(foo1, foo2)).to.be.equal(true)
        expect(equals(foo1, foo3)).to.be.equal(false)

        // calls should not increment, because values are reference identical
        expect(equals(foo1, foo1)).to.be.equal(true)
        expect(calls).to.equal(2)

      })

      it('symbolic EQUALS takes precedence', () => {

        class Foo {
          constructor (bar = 'bar') {
            this.bar = bar
          }

          equals (b) {
            throw new Error('don\'t use this method')
          }

          [EQUALS] (b) {
            return b instanceof Foo && b.bar === this.bar
          }
        }

        const foo1 = new Foo()

        expect(() => equals(foo1, foo1)).to.not.throw('don\'t use this method')
      })
    })
  })

  it('checks for identicality first', () => {

    let count = 0

    class EqualSpy {
      [EQUALS] (b) {
        count++
        return this === b
      }
    }

    const e = new EqualSpy(1)

    expect(equals(e, e)).to.equal(true)
    expect(count).to.equal(0)

  })

  describe('allows primitives to be compared in overridden equality methods', () => {

    function accountEquals (b) {

      const a = this.amount
      b = b instanceof AccountStringEquals ? b.amount : b

      return a === b || (Number.isNaN(a) && Number.isNaN(b))
    }

    class AccountStringEquals {
      constructor (amount) {
        if (amount instanceof AccountStringEquals)
          amount = amount.amount
        this.amount = amount
      }

      toString () {
        return `$${this.amount}`
      }

      equals = accountEquals

    }

    class AccountSymbolEquals extends AccountStringEquals {
      [EQUALS] = accountEquals
    }

    const testAccount = Account => () => {

      const blingin = new Account(10000)
      const poor = new Account(-5)
      const invalid = new Account(NaN)

      const amounts = [
        invalid, blingin, poor, blingin.amount, poor.amount, null,
        invalid.amount, 0, Infinity
      ]

      for (const a of amounts)
        for (const b of amounts) {
          const result =
            (Number.isNaN(a) && Number.isNaN(b)) ||
            (a === null && b === null) ||
            (a !== null && b !== null &&
              new Account(a)::accountEquals(new Account(b))
            )

          it(inspect`equals(${a}, ${b}) === ${result}`, () => {
            expect(equals(a, b)).to.equal(result)
          })

        }

    }

    describe('works on EQUALS method', testAccount(AccountStringEquals))

    describe('works on \'equals\' method', testAccount(AccountSymbolEquals))

  })

})
