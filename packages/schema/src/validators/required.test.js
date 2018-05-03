import { expect } from 'chai'

import required from './required'

import { SELF } from '../util'

import Schema from '../schema'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('required() stock validator', () => {

  // const r = required()

  describe('returns error if input is undefined, null or NaN', () => {

    for (const bad of [ null, undefined, NaN ])
      it(`${bad}`, () => {
        expect(r(bad)).to.be.instanceof(Error)
      })

  })

  describe('returns the value otherwise', () => {

    for (const good of [ 0, -1, 1, {}, false, true, 'string' ])
      it(`${good}`, () => {
        expect(r(good)).to.be.equal(good)
      })

  })

  describe('takes a configuration', () => {

    it('as a non-empty string', () => {
      expect(() => required('Error.')).to.not.throw(Error)
      expect(() => required('')).to.throw('non-empty')
    })

    it('as an object with err field', () => {
      expect(() => required({ err: 'Error.' })).to.not.throw(Error)
    })

  })

  describe('in schema', () => {

    it('is optionally configurable', () => {

      const s = Schema(required)

      expect(() => s(null)).to.throw('is Required.')
    })

    it('practical example', () => {

      const schema = Schema({
        [SELF]: required,
        name: required,
        age: required
      })

      expect(() => schema(null)).to.throw('is Required.')
      expect(() => schema({ })).to.throw('name is Required.')
      expect(() => schema({ name: 'Ben' })).to.throw('age is Required.')
      expect(() => schema({ name: 'Ben', age: 33 })).to.not.throw()

    })
  })
})
