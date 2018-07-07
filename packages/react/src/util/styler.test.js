import React from 'react'
import styled from 'styled-components'

import renderer from 'react-test-renderer'

import { expect } from 'chai'
import { Styler } from './styler'

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

})
