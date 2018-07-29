import React from 'react'
import styled from 'styled-components'

import renderer from 'react-test-renderer'

import { expect } from 'chai'
import Styler from './styler'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('styler', () => {

  it('is a class', () => {
    expect(Styler).to.throw('invoked without \'new\'')
  })

  let PosDiv
  before(() => {
    const $ = new Styler()
    PosDiv = styled.div`
      position: ${$.prop('absolute').mut(v => v ? 'absolute' : 'relative')};
    `
  })

  it('can be used to create styled-component functions', () => {
    const div = renderer.create(<PosDiv absolute/>)
    expect(div).toHaveStyleRule('position', 'absolute')
  })

  describe('prop()', () => {

    const props = { foo: { bar: 'cake' } }

    it('returns value of prop at path', () => {

      const $ = new Styler()
      const getFooBar = $.prop('foo', 'bar').valueOf()

      expect(getFooBar(props)).to.be.equal('cake')
    })

    it('throws if path is undefined', () => {
      const $ = new Styler()
      expect(() => $.prop().valueOf()(props)).to.throw('Provide a path as string arguments.')
    })

  })

})
