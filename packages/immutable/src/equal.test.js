import { expect } from 'chai'
import { equals, EQUALS } from '../src'
import { inspect } from 'util'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const equalizers = {}
equalizers.argument = (a, b) => equals(a, b)
equalizers.bound = (a, b) => a::equals(b)

const describer = {}
describer.argument = `equals(a, b)`
describer.bound = `a::equals(b)`

describe('equals()', () => {

  for (const method in equalizers) {

    const equalizer = equalizers[method]

    describe(`${method} syntax: ${describer[method]}`, () => {

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
            it(`${inspect(a)} equals ${inspect(b)} : ${output}`, () => {
              expect(equalizer(a, b)).to.equal(output)
            })
        })

        describe('works on arrays', () => {
          it('[1,2,3] equals [1,2,3]', () =>
            expect(equalizer([1, 2, 3], [1, 2, 3])).to.be.true
          )

          it('[1,2] not equal [1,2,3]', () =>
            expect(equalizer([1, 2], [1, 2, 3])).to.not.be.true
          )
        })

        describe('works on objects', () => {

          it('plain', () => {

            const obj1 = { foo: 'bar' }
            const obj2 = { foo: 'bar' }
            const obj3 = { foo: 'baz' }

            expect(equalizer(obj1, obj1)).to.be.equal(true)
            expect(equalizer(obj1, obj2)).to.be.equal(true)
            expect(equalizer(obj1, obj3)).to.be.equal(false)

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

            expect(equalizer(foo1, foo1)).to.be.equal(true)
            expect(equalizer(foo1, foo2)).to.be.equal(true)
            expect(equalizer(foo1, foo3)).to.be.equal(false)
            expect(calls).to.be.equal(3)

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

            expect(equalizer(foo1, foo1)).to.be.equal(true)
            expect(equalizer(foo1, foo2)).to.be.equal(true)
            expect(equalizer(foo1, foo3)).to.be.equal(false)
            expect(calls).to.equal(3)

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

            expect(() => equalizer(foo1, foo1)).to.not.throw('don\'t use this method')

          })
        })
      })
    })
  }

})
