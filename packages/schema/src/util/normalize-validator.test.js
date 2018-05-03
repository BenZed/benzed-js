import { expect } from 'chai'
// import normalizeDefinition from './normalize-definition'

// import { inspect } from '@benzed/dev'
// import { OPTIONAL_CONFIG } from './symbols'
//
import { string, number, arrayOf } from '../types'

import normalizeValidator from './normalize-validator'

import Context from './context'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('normalizeDefinition', () => {

  it('is a function', () => {
    expect(normalizeValidator).to.be.instanceof(Function)
  })

  describe('if given an array', () => {

    it('places contents in an arrayOf validator', () => {

      const arrayOfString = normalizeValidator([ string ])

      expect(arrayOfString).to.have.property('name', 'arrayOf')

      expect(arrayOfString([ 'string' ])).to.deep.equal([ 'string' ])

    })

    it('throws if array is empty', () => {

      expect(() => normalizeValidator([])).to.throw('arrayOf config requires Function \'type\' property')

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

})
