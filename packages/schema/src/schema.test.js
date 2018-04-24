import { expect } from 'chai'
import Schema from './index'
import is from 'is-explicit'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Schema', () => {

  it('returns a validator', () => {
    const schema = Schema([ value => value ])
    expect(typeof schema).to.be.equal('function')
  })

  const type = Type => value => is(value, Type)
    ? value
    : new Error(`Must be of type: ${Type.name}`)

  describe('usage', () => {

    it('creates validators that run methods on data', () => {

      const message = new Schema({

        body: type(String),
        author: {
          name: type(String),
          id: type(Number)
        }
      })

      expect(() => message({ body: null })).to.throw('Must be of type: String')

    })

    it('does not mutate input data', () => {

      class Foo {
        constructor (bar = 0) {
          this.bar = bar
        }
        copy () {
          return new Foo(this.bar)
        }
        equals (b) {
          return b instanceof Foo && b.bar === this.bar
        }
      }

      const mustBeFoo = value => value instanceof Foo
        ? value
        : new Error('Must be a Foo')

      const cantBeZero = value => value.bar === 0
        ? new Error('Can\'t be zero.')
        : value

      const absPos = value => new Foo(Math.abs(value.bar))

      const foo = new Schema([ mustBeFoo, cantBeZero, absPos ])

      const input = new Foo(1)
      const output = foo(input)

      expect(output).to.not.equal(input)
      expect(foo(new Foo(-1))).to.be.deep.equal({ bar: 1 })
      expect(() => foo(new Foo(0))).to.throw('Can\'t be zero.')

    })

  })

})
