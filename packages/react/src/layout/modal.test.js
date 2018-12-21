import Modal from './modal'
import React from 'react'

import renderer from 'react-test-renderer'

import { expect } from 'chai'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

// TODO replace toHaveStyleRyle
function expectStyle (style) {
  for (const property in style)
    expect(this).toHaveStyleRule(property, `${style[property]}`)
}

describe('Modal component', () => {

  let test

  before(() => {
    test = renderer.create(<Modal/>)
  })

  it.skip('takes up whole screen', () => {
    test::expectStyle({
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    })
  })

  it.skip('obscures background', () => {
    test::expectStyle({
      'z-index': Modal.Z,
      'background-color': 'rgba(0,0,0,0.5)'
    })
  })

  it.skip('centers children', () => {
    test::expectStyle({
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center'
    })
  })
})
