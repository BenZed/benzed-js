import Schema from '../'
import { SCHEMA } from '../create-validator'

import { expect } from 'chai'
import Type from './type'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('Type', () => {

  it('is a class', () => {
    expect(() => Type())
      .to
      .throw('cannot be invoked without \'new\'')
  })

  it('most basic type, used for \'any\'', () => {

    expect(<any/>[SCHEMA]
      .type
      .constructor
    ).to.be.equal(Type)

  })

})
