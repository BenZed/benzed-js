import { expect } from 'chai'
import is from 'is-explicit'

import Type from './type'
import ValueType from './value-type'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

// @jsx require('../schema').default.create
/* eslint-disable react/react-in-jsx-scope */

describe('ValueType', () => {

  it('extends Type', () => {
    expect(is.subclassOf(ValueType, Type))
      .to
      .be
      .equal(true)
  })

  it('has null as root type', () => {
    expect(new ValueType()[Type.ROOT])
      .to
      .be
      .equal(null)
  })

  describe('type validation', () => {

    it('validates value equivalents', () => {

      const chess = <value>
        {'black'}{'white'}
      </value>

      expect(chess.validate('black'))
        .to.be.equal('black')

      expect(() => chess.validate('orange'))
        .to.throw('must be either: \'black\', \'white\'')
    })

    it('children are required', () => {
      expect(() => <value/>)
        .to.throw('ValueType must have children')
    })

    it('intelligently handles single array children', () => {

      const coin = <value>
        {[ 'heads', 'tails' ]}
      </value>

      expect(coin.validate('heads'))
        .to.be.equal('heads')

      expect(coin.validate('tails'))
        .to.be.equal('tails')
    })

    it('intelligently handles single string children', () => {
      const coin = <value>
        heads tails
      </value>

      expect(coin.validate('heads'))
        .to.be.equal('heads')

      expect(coin.validate('tails'))
        .to.be.equal('tails')
    })

  })

  describe('validators', () => {
    describe('deep', () => {
      it('allows value checking to use @benzed/immutable equals', () => {
        const hardware = <oneOf deep>
          {[
            { model: 'fx700', engine: 'ffmpeg' },
            { model: 'psb', engine: 'zoom' }
          ]}
        </oneOf>

        expect(hardware.validate({
          model: 'fx700', engine: 'ffmpeg'
        })).to.be.deep.equal({
          model: 'fx700', engine: 'ffmpeg'
        })
      })

      it('can also provide a function', () => {
        const closeEnough = (values, value) => values
          .some(num => value << 0 === num)

        const bytes = <value deep={closeEnough}>
          {2}{4}{8}{16}{32}{64}
        </value>

        expect(bytes.validate(2.2))
          .to.be.equal(2.2)
      })

      it('must be a function if not true', () => {
        expect(() => <value deep='reference-equality'>one two three</value>)
          .to.throw('custom deep equality check prop must be a function')
      })
    })
  })
})
