import { expect } from 'chai'
import is from 'is-explicit'

import Type from './type'
import ObjectType from './object-type'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

// @jsx require('../schema').default.create
/* eslint-disable react/react-in-jsx-scope */

describe('ObjectType', () => {

  it('extends SpecificType', () => {
    expect(is.subclassOf(ObjectType, Type))
      .to
      .be
      .equal(true)
  })

  it('has object as root type', () => {
    expect(new ObjectType()[Type.ROOT])
      .to
      .be
      .equal(Object)
  })

  describe.only('type validation', () => {

    it('validates objects', () => {

      const obj = <object />

      const input = {}

      expect(obj.validate(input))
        .to.be.equal(input)

      expect(() => obj.validate('cake'))
        .to.throw('must be an object')
    })

    it('arrays don\'t count', () => {
      const obj = <object />

      const arr = []

      expect(() => obj.validate(arr))
        .to.throw('must be an object')
    })

    it('plain prop forced plain objects', () => {
      const plain = <object plain />

      const input = {}

      function Foo () {}

      expect(plain.validate(input))
        .to.be.equal(input)

      expect(() => plain.validate(new Foo()))
        .to.throw('must be a plain object')
    })

  })

})
