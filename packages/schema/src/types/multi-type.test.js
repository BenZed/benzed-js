import { expect } from 'chai'
import is from 'is-explicit'

import Type from './type'
import MultiType from './multi-type'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

// @jsx require('../create-validator').default
/* eslint-disable react/react-in-jsx-scope */

describe('MultiType', () => {

  it('extends Type', () => {
    expect(is.subclassOf(MultiType, Type))
      .to
      .be
      .equal(true)
  })

  it('has { name: "multi-type" } as root type', () => {
    expect(new MultiType()[Type.$$root])
      .to
      .be
      .deep
      .equal({ name: 'MultiType' })
  })

  describe('type validation', () => {

    it('used to test if a value is one of multiple types', () => {

      const primitive = <oneOfType>
        <number/>
        <string/>
        <bool/>
      </oneOfType>

      for (const goodValue of [ 'true', true, 1, 'false', false, 0 ])
        expect(primitive(goodValue))
          .to.be.equal(goodValue)

      for (const badValue of [ {}, Symbol('hmm'), [] ])
        expect(() => primitive(badValue))
          .to.throw('must be of type: Boolean')
    })

    it('allows null and undefined', () => {

      const stringOrNum = <oneOfType>
        <string/>
        <number/>
      </oneOfType>

      expect(stringOrNum(null)).to.be.equal(null)
      expect(stringOrNum(undefined)).to.be.equal(undefined)
    })

    it('children must be schemas', () => {
      expect(() => <multi>hey</multi>)
        .to.throw('MultiType must have schemas as children')
    })

    it('throws if there are no children', () => {
      expect(() => <multi/>)
        .to.throw('MultiType must have children')
    })

  })

})
