import { expect } from 'chai'
import Schema from './schema'

import { string, number, oneOfType } from './types'
import { required } from './validators'
// import { TYPE } from './util/symbols'

/******************************************************************************/
// Temp
/******************************************************************************/

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Schema', () => {

  describe('takes definition argument', () => {

    it('can be a type function', () => {
      expect(() => Schema(string)).to.not.throw()
    })

    it('can be a plain object', () => {

      expect(() => Schema({
        name: string,
        age: number
      })).to.not.throw()

    })

    it('can be an array', () => {

      expect(() => Schema([number])).to.not.throw()

    })

    it('can be a type function', () => {

      expect(() => Schema(oneOfType(number, string))).to.not.throw()

    })

    it('throws otherwise', () => {
      for (const badValue of [ 0, 1, Symbol('cake') ])
        expect(() => Schema(badValue)).to.throw('validators must be defined as arrays, objects or functions')

      for (const almostValue of [ required, () => {} ])
        expect(() => Schema(almostValue)).to.throw('Schema must be defined with a type function, or an array or plain object thereof')
    })

  })

  describe('plain object input', () => {
    it('act as object() type validator', () => {
      const schema = new Schema({
        name: string,
        age: number
      })

      expect(() => schema('string')).to.throw('Must be an Object')
    })
    it('additional arguments act as args for config', () => {
      const schema = new Schema({
        name: string,
        age: number
      },
      false // should allow for arbitrary shape keys
      )

      expect(schema({
        name: 'joe',
        job: 'cook'
      })).to.deep.equal({
        name: 'joe',
        job: 'cook'
      })
    })
  })

  it('returns a validator', () => {
    const schema = Schema(string)
    expect(typeof schema).to.be.equal('function')
  })

})
