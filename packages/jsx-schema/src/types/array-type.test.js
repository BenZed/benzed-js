import { expect } from 'chai'
import is from 'is-explicit'

import Type from './type'
import ArrayType from './array-type'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

// @jsx require('../schema').default.create
/* eslint-disable react/react-in-jsx-scope */

describe('ArrayType', () => {

  it('extends Type', () => {
    expect(is.subclassOf(ArrayType, Type))
      .to
      .be
      .equal(true)
  })

  it('has array as root type', () => {
    expect(new ArrayType()[Type.ROOT])
      .to
      .be
      .equal(Array)
  })

  describe('type validation', () => {
    it('validates arrays', () => {
      const arr = <array />
      const input = []

      expect(arr.validate(input))
        .to.be.equal(input)

      expect(() => arr.validate('cake'))
        .to.throw('must be an array')
    })
  })

  describe('children', () => {
    it('defines type for array items', () => {
      const scores = <array required>
        <number required clamp={[0, 5]}/>
      </array>

      expect(scores.validate([0, 1, 10, 1]))
        .to.be.deep.equal([0, 1, 5, 1])

      expect(() => scores.validate([0, 1, undefined]))
        .to.throw('is required')

      expect(() => scores.validate([0, 1, undefined]))
        .to.throw('is required')
    })

    it('must be a schema', () => {
      expect(() => <array>
        Whats up NERDS
      </array>).to.throw('ArrayType child must be a schema, if defined')
    })

    it('if defined, must be a single child', () => {
      expect(() => <array>
        <number />
        <string />
      </array>).to.throw('ArrayType may have a maximum of one child')
    })
  })

  describe('validators', () => {
    describe('cast', () => {
      it('defaults to wrap', () => {
        const whatever = <array cast />
        expect(whatever.validate(1))
          .to.be.deep.equal([1])
      })
      it('allows a cast function', () => {
        const chars = <array cast={value => value.split('')} />
        expect(chars.validate('cast'))
          .to.be.deep.equal(['c', 'a', 's', 't'])
      })
      it('enabled value must be true or a function', () => {
        expect(() => <array cast='to-a-number-or-whatever' />)
          .to.throw('cast prop must be true or a function')
      })
    })
  })
})
