import { expect } from 'chai'
import is from 'is-explicit'

import Type from './type'
import ObjectType from './object-type'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

// @jsx require('../create-validator').default
/* eslint-disable react/react-in-jsx-scope */

describe('ObjectType', () => {

  it('extends Type', () => {
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

  describe('type validation', () => {

    it('validates objects', () => {
      const obj = <object />
      const input = {}

      expect(obj(input))
        .to.be.equal(input)

      expect(() => obj('cake'))
        .to.throw('must be an object')
    })

    it('arrays don\'t count', () => {
      const obj = <object />
      const arr = []

      expect(() => obj(arr))
        .to.throw('must be an object')
    })

    it('plain prop forced plain objects', () => {
      const plain = <object plain />

      const input = {}

      function Foo () {}

      expect(plain(input))
        .to.be.equal(input)

      expect(() => plain(new Foo()))
        .to.throw('must be a plain object')
    })

    it('plain isn\'t defined on props if not used', () => {
      const anyOlObject = <object />
      expect(anyOlObject.props).to.not.have.property('plain')
    })

    it('plain exists in props if it is used', () => {
      const strictObj = <object plain />
      expect(strictObj.props).to.have.property('plain', true)
    })
  })

  describe('children', () => {

    it('children define schemas for child properties', () => {

      const person = <object plain>
        <string key='name'
          length={['>', 0]}
          required
        />
        <number key='age'
          cast
          default={0}
          range={['>=', 0]}
        />
      </object>

      expect(person({
        name: 'baby-jesus'
      })).to.be.deep.equal({
        name: 'baby-jesus',
        age: 0
      })

    })

    it('children must be schemas', () => {
      expect(() => <object>
        {[ 'Hey', 'hey' ]}
      </object>).to.throw('ObjectType children must be schemas')
    })

    it('children must have keys', () => {
      expect(() => <object>
        <string />
      </object>).to.throw('ObjectType children must have unique key')
    })

    it('object keys must be unique', () => {
      expect(() =>
        <object>
          <string key={0} />
          <string key='0' />
        </object>
      ).to.throw('ObjectType children must have unique key')
    })

  })

  describe('validators', () => {

    describe('strict', () => {
      it('restricts object keys to those defined by children', () => {

        const vector2 = <object strict plain>
          <number key='x' required />
          <number key='y' required />
        </object>

        expect(vector2({
          x: 0,
          y: 0,
          z: 1
        })).to.be.deep.equal({
          x: 0,
          y: 0
        })

      })
      it('throws if no children are defined', () => {
        expect(() => <object strict/>)
          .to.throw('ObjectType strict can only be enabled on schemas with children')
      })
      it('isn\'t defined on props if not used', () => {
        const anyOlObject = <object />
        expect(anyOlObject.props).to.not.have.property('strict')
      })

      it('exists in props if it is used', () => {
        const strictObj = <object strict >
          <string key='name'/>
        </object>
        expect(strictObj.props).to.have.property('strict', true)
      })
    })
  })
})
