import { expect } from 'chai'

// eslint-disable-next-line no-unused-vars
import BooleanType from './boolean-type'
import SpecificType from './specific-type'
import { SCHEMA } from '../util'
import is from 'is-explicit'

/******************************************************************************/
// Data
/******************************************************************************/

const { ROOT } = SpecificType

// @jsx require('../create-validator').default
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('BooleanType', () => {

  it('extends SpecificType', () => {
    expect(is.subclassOf(BooleanType, SpecificType))
      .to
      .be
      .equal(true)
  })

  it('has bool as root type', () => {
    expect(new BooleanType()[ROOT])
      .to
      .be
      .equal(Boolean)
  })

  it('is resolved by Schema', () => {
    expect(<bool/>[SCHEMA].type)
      .to
      .be
      .instanceof(BooleanType)
  })

  describe('validators', () => {

    describe('extended cast', () => {

      it('allows default cast value', () => {
        expect(() => <bool cast />).to.not.throw(Error)
        expect(() => <boolean cast />).to.not.throw(Error)
      })

      it(`string 'true' becomes true`, () => {
        expect((<bool cast/>)('true'))
          .to.be.equal(true)
      })

      it(`string 'false' becomes false`, () => {
        expect((<bool cast/>)('false'))
          .to.be.equal(false)
      })

      for (const number of [ NaN, 0, 1, -1, Infinity, -Infinity ])
        it(`${number} casts to ${!!number}`, () => {
          expect((<bool cast/>)(number))
            .to.be.equal(!!number)
        })

      it(`doesn't cast objects`, () => {
        expect(() => (<bool cast/>)({}))
          .to.throw('must be of type: Boolean')
      })

      it(`doesn't cast other strings`, () => {
        expect(() => (<bool cast/>)('lololoo'))
          .to.throw('must be of type: Boolean')
      })
    })
  })
})
