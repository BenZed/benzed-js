import { expect } from 'chai'
import ValidationError from './validation-error'
import is from 'is-explicit'

// @jsx require('../create-validator').default
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('ValidationError', () => {

  it('is a class', () => {
    expect(ValidationError).to.throw(`without 'new'`)
  })

  it('extends error', () => {
    expect(is.subclassOf(ValidationError, Error)).to.be.equal(true)
  })

})
