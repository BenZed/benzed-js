import { expect } from 'chai'

// eslint-disable-next-line no-unused-vars
import NumberType from './number-type'
import SpecificType from './specific-type'

import is from 'is-explicit'
import { $$schema } from '../util'

const { $$root } = SpecificType

// @jsx require('../create-validator').default
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('NumberType', () => {

  it('extends SpecificType', () => {
    expect(is.subclassOf(NumberType, SpecificType))
      .to
      .be
      .equal(true)
  })

  it('has number as root type', () => {
    expect(new NumberType()[$$root])
      .to
      .be
      .equal(Number)
  })

  it('is resolved by Schema', () => {
    expect(<number/>[$$schema].type)
      .to
      .be
      .instanceof(NumberType)
  })

  describe('validators', () => {

    describe('extended cast', () => {

      it('allows default cast value', () => {
        expect(() => <number cast />).to.not.throw(Error)
      })

      for (const primitive of [ true, false, '100', 'Infinity' ])
        it(`primitive ${primitive} become ${Number(primitive)}`, () => {
          expect((<number cast/>)(primitive))
            .to.be.equal(Number(primitive))
        })

      it('does not cast NaN', () => {
        expect(() => (<number cast/>)(NaN))
          .to.throw('must be of type: Number')
      })
    })

    describe('clamp', () => {

      it('clamps a value between two values', () => {
        expect((<number clamp={[ 1, 100 ]} />)(110))
          .to.be.equal(100)

        expect((<number clamp={[ 1, 100 ]} />)(0))
          .to.be.equal(1)
      })

      it('throws if min is below max', () => {
        expect(() => <number clamp={[100, 0]} />)
          .to.throw('min value must be below max')
      })

      it('sets props.clamp with config value', () => {
        expect(<number clamp/>.props.clamp).to.be.deep.equal({
          min: 0,
          max: 1
        })
      })

    })
  })
})
