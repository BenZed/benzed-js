import { expect } from 'chai'
import { Test } from '@benzed/dev'

import propsPluck from './props-pluck'
import { copy } from '@benzed/immutable'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(propsPluck, propsPluck => {

  describe('pulls keys from object', () => {

    const PROPS = { foo: true, bar: true, city: true }

    let props
    let plucked
    before(() => {
      props = PROPS::copy()
      plucked = propsPluck(props, 'foo', 'bar', 'cake')
    })

    it('pulls props from input object if keys exist', () => {
      expect(plucked).to.have.property('foo')
      expect(plucked).to.have.property('bar')
      expect(plucked).to.not.have.property('cake')
    })

    it('removes found keys from input object', () => {
      expect(props).to.not.have.property('foo')
      expect(props).to.not.have.property('bar')
      expect(props).to.have.property('city')
    })
  })

  describe('doesnt create objects unnecessarily', () => {

    it('returns null if no keys found', () => {
      expect(propsPluck({}, 'hammer')).to.be.equal(null)
    })

  })

})
