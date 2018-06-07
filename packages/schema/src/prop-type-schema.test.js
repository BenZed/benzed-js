import { expect } from 'chai'
import PropTypeSchema from './prop-type-schema'
import { bool, number, string } from './types'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('PropTypeSchema', () => {

  let example
  before(() => {
    example = {
      name: string,
      age: number,
      admin: bool
    }
  })

  it('takes an object of validators', () => {
    expect(() => new PropTypeSchema(example)).to.not.throw(Error)
    for (const badValue of [null, undefined, 'string', false, Symbol('symbol'), []])
      expect(() => new PropTypeSchema(badValue)).to.throw('must be defined with an object of validators')
  })

  it('returns an object of propcheckers', () => {
    expect(new PropTypeSchema(example))
      .to.be.instanceof(Object)
  })

  it('normalizes validators on input object', () => {
    const checker = new PropTypeSchema({
      str1: string,
      str2: string()
    })
    const props = {
      str1: {},
      str2: {}
    }

    const result1 = checker.str1(props, 'str1', 'Component')
    const result2 = checker.str1(props, 'str2', 'Component')
    expect(result1).to.be.instanceof(Error)
    expect(result2).to.be.instanceof(Error)
  })

  describe('validators according to prop-type behaviour', () => {
    it('returns error formatted with propname and component name')
    it('returns null if no error')
  })

})
