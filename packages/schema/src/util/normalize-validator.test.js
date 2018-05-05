import { expect } from 'chai'

import { OPTIONAL_CONFIG, TYPE } from './symbols'

import { string, number } from '../types'

import normalizeValidator from './normalize-validator'

import Context from './context'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('normalizeDefinition', () => {

  it('is a function', () => {
    expect(normalizeValidator).to.be.instanceof(Function)
  })

  describe('if given an array', () => {

    it('places contents in an arrayOf validator', () => {

      const arrayOfString = normalizeValidator([ string ])

      expect(arrayOfString).to.have.property('name', 'arrayOf')

      expect(arrayOfString([ 'string' ], new Context())).to.deep.equal([ 'string' ])

    })

    it('throws if array is empty', () => {

      expect(() => normalizeValidator([]))
        .to
        .throw('validator can not be defined as an empty array')

    })

  })

  describe('if given an object', () => {

    it('places contents in an object validator', () => {

      const info = normalizeValidator({
        name: string,
        age: number
      })

      expect(info).to.have.property('name', 'object')

      expect(info({ name: 'ben' }, new Context())).to.deep.equal({ name: 'ben' })

    })

    it('throws if object is empty', () => {

      expect(() => normalizeValidator({})).to.throw('object config \'shape\' property requires at least one key')

    })

  })

  describe('if given a function', () => {

    const allPass = value => value

    it('great. thats it.', () => {
      expect(() => normalizeValidator(allPass)).to.not.throw()
    })

  })

  describe('reduces zero config functions', () => {

    it('returns composed function', () => {
      const nested = () => {}

      const zeroConfig = () => {

        return nested
      }

      zeroConfig[OPTIONAL_CONFIG] = true

      expect(normalizeValidator(zeroConfig)).to.equal(nested)
    })

    it('throws if zero config functions dont return a function', () => {

      const zeroConfigBad = () => {
        return false
      }

      zeroConfigBad[OPTIONAL_CONFIG] = true

      expect(() => normalizeValidator(zeroConfigBad)).to.throw('OPTIONAL_CONFIG enabled must return a function')

    })

  })

  describe('nesting', () => {

    it('works for objects nested in arrays', () => {

      const def = [{
        name: string,
        age: number
      }]

      const validator = normalizeValidator(def)

      expect(validator[TYPE]).to.be.equal('Array of Object')

    })

    it('works for arrays nested in objects', () => {

      const def = {
        names: [string],
        ages: [number]
      }

      const validator = normalizeValidator(def)

      const data = {
        names: [ 'shuck', 'jane' ],
        ages: [ 30, 40 ]
      }

      const context = new Context()

      expect(validator(data, context)).to.be.deep.equal(data)

      const bad = {
        names: true,
        ages: NaN
      }

      expect(() => validator(bad, context)).to.throw('Must be an Array of Number')

    })

    it('works for objects nested in arrays nested in objects', () => {

      const def = {
        meta: [{
          key: string,
          code: number
        }]
      }

      const validator = normalizeValidator(def)

      const data = {
        meta: [
          { key: 'ace', code: 0 },
          { key: 'base', code: 1 }
        ]
      }

      const context = new Context()

      expect(validator(data, context)).to.deep.equal(data)

      const data2 = {
        meta: { key: 'cake', code: 100 }
      }

      expect(validator(data2, context)).to.deep.equal({
        meta: [{ key: 'cake', code: 100 }]
      })

    })

  })

})
