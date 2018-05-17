import { expect } from 'chai'

import required from './required'
import { string, number } from '../types'

import Schema from '../schema'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('required() stock validator', () => {

  const r = required()

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

      const s = Schema(string(required))

      expect(() => s(null)).to.throw('is Required.')
    })

    it('practical example', () => {

      const schema = Schema({
        name: string(required),
        age: number(required)
      })

      expect(() => schema({ })).to.throw('name is Required.')
      expect(() => schema({ name: 'Ben' })).to.throw('age is Required.')
      expect(() => schema({ name: 'Ben', age: 33 })).to.not.throw()

    })

    it('empty strings count', () => {

      const schema = Schema({
        dir: string(required)
      })

      expect(() => schema({ })).to.throw('dir is Required.')
      expect(() => schema({ dir: '' })).to.not.throw('dir is Required.')
      expect(() => schema({ dir: '/whatever/man' })).to.not.throw('dir is Required.')

    })
  })
})
