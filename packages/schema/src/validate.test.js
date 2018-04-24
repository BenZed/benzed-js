import { expect } from 'chai'

import validate from './validate'
import normalizeDefinition from './util/normalize-definition'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('validate()', () => {

  it('returns output from definitions, data and context')

  describe('definitions', () => {

    describe('if an array of functions', () => {
      it('chains the input data into each function, returning the result')
      it('if the result is an error, wraps it in a ValidationError and throws')
      it('skips remaining functions is result is SKIP symbol')
      it('does not return SKIP symbol')
    })

    describe('if a plain object', () => {
      it('recursively calls validate() on each object key')
      it('validate is not called on each object key if input is not object')
      it('calls SELF on object before sub properties')
      it('returns a plain object output for each key')
      it('undefined values are not added to output object')
    })

  })

  describe('context', () => {

    it('holds the path of the current validation from the original input')
    it('path auto increments for each nested object')
    it('holds arguments supplied with the original validate() call')
    it('holds the original data supplied to validate()')

  })

})
