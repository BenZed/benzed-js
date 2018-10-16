import { expect } from 'chai'
import createValidator, { SCHEMA } from './create-validator'
import is from 'is-explicit'

import {
  StringType, BooleanType, NumberType, ArrayType, ObjectType, SpecificType,
  Type, ValueType, MultiType
} from './types'

/* eslint-disable react/react-in-jsx-scope, react/prop-types */ // @jsx createValidator

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('functional schema instead of class based one', () => {

  describe('createValidator', () => {
    it('should return a function', () => {
      const validator = createValidator('string', { uppercase: true })
      const validator2 = <string uppercase />

      expect(validator).to.be.instanceof(Function)
      expect(validator2).to.be.instanceof(Function)
    })

    describe('returned function', () => {

      it('should have symbolic Schema property', () => {
        const validator = <string />
        expect(validator).to.have.property(SCHEMA)
      })

      it('should have schema shortcuts', () => {
        const validator = <string />
        expect(validator).to.have.property('isSchema', true)
        expect(validator).to.have.deep.property('props', { children: null })
        expect(validator).to.have.property('type', String)
      })

      it('should validate data', () => {
        const validator = <string uppercase />

        expect(() => validator(100)).to.throw(TypeError)
      })
    })

    it('can nest existing validators', () => {
      const Code = <string uppercase length={['>', 0]}/>
      const id = <Code length={9} />

      expect(id).to.have.property('props')
      expect(id.props).to.have.property('uppercase', true)
      expect(id.props).to.have.property('length', 9)
      expect(id.type).to.be.equal(String)
    })

    it('can use custom compilers', () => {

      const Multiply = props =>
        value => is.number(value)
          ? value * props.by
          : value

      const double = <Multiply by={2} />
      const triple = <Multiply by={3} />

      expect(double(4)).to.be.equal(8)
      expect(triple(3)).to.be.equal(9)

      expect(double).to.have.property(SCHEMA)
    })
  })
})
