import { expect } from 'chai'
import normalizeDefinition from './normalize-definition'

import { inspect } from '@benzed/dev'
import { ZERO_CONFIG, SELF } from './symbols'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('normalizeDefinition', () => {

  describe('input', () => {

    it('can be a plain object', () => {
      expect(() => normalizeDefinition({ foo () {} }).to.not.throw(Error))
    })

    it('plain object must have at least one property', () => {
      expect(() => normalizeDefinition({})).to.throw('must have at least one key')
    })

    it('plain object with SELF symbol cannot be a nested object', () => {

      const pass = value => value

      const badSelfDef = {
        [SELF]: {
          foo: pass
        }
      }

      expect(() => normalizeDefinition(badSelfDef)).to.throw('SELF symbol must be a function or array of functions')
    })

    it('can be an array', () => {
      expect(() => normalizeDefinition([ value => value ]).to.not.throw(Error))
    })

    it('must be an array of functions', () => {
      expect(() => normalizeDefinition([])).to.throw('must be an array of functions')
    })

    it('can be a function', () => {
      expect(() => normalizeDefinition(value => value)).to.not.throw(Error)
    })

    describe('throws if not array, function or object', () => {
      for (const badValue of [true, false, 0, Symbol('hey'), NaN, undefined, null])
        it(inspect`${badValue} throws`, () => {
          expect(() => normalizeDefinition(badValue)).to.throw('must be a plain object, function, or array of functions')
        })
    })

  })

  describe('output', () => {

    it('places functions into an array', () => {

      const doNothing = value => value

      expect(normalizeDefinition(doNothing)).to.be.deep.equal([ doNothing ])

    })

    it('resolves ZERO_CONFIG functions', () => {

      const disallowNullValidator = msg =>
        value =>
          value === null
            ? new Error(msg || 'null is disallowed')
            : value

      disallowNullValidator[ZERO_CONFIG] = true

      const [ normalized ] = normalizeDefinition(disallowNullValidator)
      expect(normalized).not.be.equal(disallowNullValidator)

      const err = normalized(null)
      expect(err).to.have.property('message', 'null is disallowed')
    })

    it('throws of ZERO_CONFIG does not return a function', () => {
      const incorrectlyMadeValidator = value => Symbol('see-what-you-done-is-fucked-up')
      incorrectlyMadeValidator[ZERO_CONFIG] = true

      expect(() => normalizeDefinition([ incorrectlyMadeValidator ]))
        .to
        .throw('ZERO_CONFIG enabled must return a function')
    })

    it('normalizes sub definitions on objects', () => {
      const trueToObj = value => value === true
        ? {}
        : value

      const validators = {
        config: trueToObj
      }

      expect(normalizeDefinition(validators)).to.be.deep
        .equal({ config: [ trueToObj ] })
    })

    it('normalizes SELF definitions on objects', () => {

      const isObject = value => typeof value === 'object'
        ? value
        : new Error('must be an object')

      const selfVal = {
        [SELF]: isObject
      }

      expect(normalizeDefinition(selfVal)).to.be.deep.equal({
        [SELF]: [ isObject ]
      })
    })
  })

})
