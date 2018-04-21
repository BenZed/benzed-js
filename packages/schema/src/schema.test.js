import { expect } from 'chai'
import Schema, { $ } from './schema'
import is from 'is-explicit'

import { inspect } from '@benzed/test'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Schema', () => {

  describe('definition', () => {

    describe('plain object', () => {
      it('can be a plain object', () => {
        expect(() => Schema({ foo () {} }).to.not.throw(Error))
      })
      it('must have at least one property', () => {
        expect(() => Schema({})).to.throw('must have at least one key')
      })
    })

    describe('array', () => {
      it('can be an array', () => {
        expect(() => Schema([ value => value ]).to.not.throw(Error))
      })
      it('must be an array of functions', () => {
        expect(() => Schema([])).to.throw('must be an array of functions')
      })
    })

    describe('function', () => {
      it('can be a function', () => {
        expect(() => Schema(value => value)).to.not.throw(Error)
      })
    })

    describe('throws otherwise', () => {
      for (const badValue of [true, false, 0, Symbol('hey'), NaN, undefined, null])
        it(inspect`${badValue} throws`, () => {
          expect(() => Schema(badValue)).to.throw('must be a plain object, function, or array of functions')
        })
    })
  })

  it('returns a validator', () => {
    const schema = Schema([ value => value ])
    expect(typeof schema).to.be.equal('function')
  })

  describe('usage', () => {

    it('creates validators that run methods on data', () => {

      const type = Type => value => is(value, Type)
        ? value
        : new Error(`Must be of type ${Type.name}`)

      const boolToObject = value => value === true
        ? {}
        : value === false
          ? null
          : value

      const message = new Schema({

        [$]: boolToObject,

        body: type(String),
        author: {
          name: type(String),
          id: type(Number)
        }
      })

      console.log(message)

      expect(message({ body: null })).to.be.instanceof(Error)

    })

  })

})
