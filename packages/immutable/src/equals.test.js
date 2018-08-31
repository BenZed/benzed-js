import { expect } from 'chai'
import { equals, EQUALS } from '../src'

import { Test, inspect } from '@benzed/dev'
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

      it('plain with mismatch keys', () => {

        const ob1 = {
          foo: 'bar'
        }

        const ob2 = {
          foo: 'bar',
          cake: 'town'
        }

        expect(equals(ob1, ob2)).to.be.equal(false)
      })

      it('works on dates', () => {
        const a = new Date()
        const b = new Date()

        expect(equals(a, b)).to.be.equal(true)

        const c = new Date(1000)

        expect(equals(a, c)).to.be.equal(false)
      })

      it('works on functions', () => {

        const foo = () => 'foo'
        const foo2 = () => 'foo'
        const bar = () => 'bar'
        const bar2 = () => 'bar'

        foo[EQUALS] = foo2[EQUALS] = bar[EQUALS] = bar2[EQUALS] = function (other) {
          return other() === this()
        }

        expect(equals(foo, bar)).to.be.equal(false)
        expect(equals(foo, foo2)).to.be.equal(true)
        expect(equals(bar, bar2)).to.be.equal(true)

      })

      it('works on class instance functions', () => {

        class Foo {
          funcProp = () => {}
          funcLoose () {}
          funcBound () {}

          constructor () {
            this.funcBound = ::this.funcBound
          }
        }

        const foo1 = new Foo()
        const foo2 = new Foo()

        expect(foo1.funcProp).to.not.equal(foo2.funcProp)
        expect(foo1.funcLoose).to.equal(foo2.funcLoose)
        expect(foo1.funcBound).to.not.equal(foo2.funcBound)

        expect(equals(foo1.funcProp, foo2.funcProp)).to.be.equal(false)
        expect(equals(foo1.funcLoose, foo2.funcLoose)).to.be.equal(true)
        expect(equals(foo1.funcBound, foo2.funcBound)).to.be.equal(false)
      })

      it('works on keyed functions with matching keyed objects', () => {

        const foo = () => {}
        const bar = {
          length: foo.length,
          name: foo.name
        }

        expect(equals(foo, bar)).to.be.equal(false)
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

      it('handles circular references', () => {

        const circle = {
          foo: 'bar'
        }

        circle.circle = circle

        expect(() => equals(circle, circle)).to.not.throw(Error)
        expect(equals(circle, { foo: 'bar', circle })).to.equal(true)

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

  it('works on native Map objects', () => {
    const mapa = new Map()
    const mapb = new Map()

    expect(equals(mapa, mapb)).to.be.equal(true)

    mapa.set(0, 'zero')
    expect(equals(mapa, mapb)).to.be.equal(false)

  })

  it('works on native Set objects', () => {
    const seta = new Set()
    const setb = new Set()

    expect(equals(seta, setb)).to.be.equal(true)

    setb.add(0)
    expect(equals(seta, setb)).to.be.equal(false)

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
