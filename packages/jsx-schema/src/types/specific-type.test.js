import { expect } from 'chai'

import Type from './type'
import SpecificType from './specific-type'

// eslint-disable-next-line
import createValidator from '../create-validator'
import { SCHEMA } from '../util'

import is from 'is-explicit'

// @jsx createValidator
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

class Foo { }

describe('SpecificType', () => {

  it('extends GenericType', () => {
    expect(is.subclassOf(SpecificType, Type))
      .to
      .be
      .equal(true)
  })

  it('used for custom types', () => {

    const foo = <Foo/>

    expect(foo[SCHEMA].type.constructor).to.be.equal(SpecificType)
    expect(foo.type).to.be.equal(Foo)
  })

  describe('validators', () => {
    describe('cast', () => {

      it('allows value to be cast to target type', () => {
        const foo = <Foo cast={() => new Foo()} />

        expect(foo('foo'))
          .to
          .be
          .instanceof(Foo)
      })

      it('throws if not given a function', () => {
        expect(() => <Foo cast={new Foo()} />)
          .to
          .throw('cast validator requires a function')
      })

      it('throws if given true, which is meant to be used as a default caster in extended types', () => {
        expect(() => <Foo cast/>)
          .to
          .throw('does not have a default casting function')
      })

      it('properly shows up in props', () => {
        const newFoo = () => new Foo()
        const foo = <Foo cast={newFoo} />

        expect(foo.props).to.have.property('cast', newFoo)
      })

      it('cast function receives validation context')

    })
  })
})
