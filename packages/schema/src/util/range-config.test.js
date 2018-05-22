// import { expect } from 'chai'
// import rangeConfig from './range-config'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('rangeConfig()', () => {

  it('returns a comparer')
  it('comparer returns value if within range')
  it('comparer returns error if not within range')

  describe('configuration', () => {

    describe('min, max, value numbers', () => {

      describe('explicit config', () => {
        it('value must not be defined for non-between operator')
        it('value must be defined for between operators')
        it('min and max must not be defined for non-between operators')
        it('min and max must be defined for between operators')
        it('min must be lower than max')
      })

      describe('implicit config', () => {
        it('value is inferred for non-between operators')
        it('at least one number is required for non-between operators')
        it('min and max are inferred for between operators')
        it('at least two numbers for min and max are required for between operators')
      })

    })

    describe('operators string', () => {
      it('must be one of >= > <=> < <=')
      it('defaults to <=>')
    })

    describe('err string or function', () => {
      it('if function receives difference description and values, output is used for error message')
      it('if string, it is used for error message')
    })

  })

})
