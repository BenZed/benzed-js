import { expect } from 'chai'

// eslint-disable-next-line no-unused-vars
import StringType from './string-type'
import SpecificType from './specific-type'

import is from 'is-explicit'

import { $$schema } from '../util'

const { $$root } = SpecificType

// @jsx require('../create-validator').default
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('StringType', () => {

  it('extends SpecificType', () => {
    expect(is.subclassOf(StringType, SpecificType))
      .to
      .be
      .equal(true)
  })

  it('has string as root type', () => {
    expect(new StringType()[$$root])
      .to
      .be
      .equal(String)
  })

  it('is resolved by Schema', () => {
    expect(<string/>[$$schema].type)
      .to
      .be
      .instanceof(StringType)
  })

  describe('validators', () => {

    describe('extended cast', () => {

      it('allows default cast value', () => {
        expect(() => <string cast />).to.not.throw(Error)
      })

      for (const primitive of [ true, false, 100, Infinity ])
        it(`primitive ${primitive} become '${String(primitive)}'`, () => {
          expect((<string cast/>)(primitive))
            .to.be.equal(String(primitive))
        })

      it('does not cast NaN', () => {
        expect(() => (<string cast/>)(NaN))
          .to.throw('must be of type: String')
      })

      it(`calls toString on objects`, () => {

        const obj = {
          toString () {
            return 'custom-tostring-func'
          }
        }

        for (const object of [ obj, [0, 1, 2] ])
          expect((<string cast/>)(object))
            .to.be.equal(object.toString())
      })

      it('doesnt call toString if it is Object.prototype.toString', () => {
        expect(() => (<string cast/>)({}))
          .to.throw('must be of type: String')
      })
    })

    describe('format', () => {

      it('throws if a string doesn\'t respect a regexp format', () => {
        const digital = <string format={/\d+/} />

        expect(() => digital('ace'))
          .to.throw('invalid format.')

        expect(digital('123'))
          .to.be.equal('123')
      })

      it('customizable error message', () => {
        const alpha = <string format={[/[A-z]+/, 'alpha characters only.']} />
        expect(() => alpha('!')).to.throw('alpha characters only')
      })

      it('schema gets config as prop', () => {

        const dna = <string format={[ /(a|c|g|t)+/, 'Not a nucleotide.' ]} />

        expect(dna.props.format).to.be.deep.equal({
          regexp: /(a|c|g|t)+/,
          err: 'Not a nucleotide.'
        })

      })
    })

    describe('uppercase', () => {

      it('uppercases strings', () => {
        const code = <string uppercase />

        expect(code('hat')).to.be.equal('HAT')
      })

    })

    describe('trim', () => {

      it('trims strings', () => {
        const code = <string trim />

        expect(code('  hat  ')).to.be.equal('hat')
      })

    })

    describe('lowercase', () => {

      it('lowercases strings', () => {
        const path = <string lowercase />

        expect(path('COW')).to.be.equal('cow')
      })

    })
  })
})
