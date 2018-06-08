import React from 'react'
import renderer from 'react-test-renderer'

import { expect } from 'chai'

import Fade from './fade'
import Visible from './visible'
import { CssCloner } from '../util'

import { milliseconds } from '@benzed/async'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const UNTIL_SHOWING = 5
const UNTIL_SHOWN = 15
const DELAY = 10

describe('Fade', () => {

  it('is a component', () => {
    expect(() => renderer.create(<Fade/>)).to.not.throw(Error)
  })

  it('passes className to child components', () => {
    const test = renderer.create(<Fade><div/></Fade>)

    expect(test.root.findByType('div').props).to.have.property('className')
  })

  it('wraps CssCloner', () => {
    const test = renderer.create(<Fade/>)
    expect(test.root.findByType(CssCloner).type).to.be.equal(CssCloner)
    // This way I dont have to rewrite all the tests that go into CssCloner
  })

  describe('takes visibility context', () => {

    const Fader = props => <Visible delay={DELAY} {...props}>
      <Fade>
        <div/>
      </Fade>
    </Visible>

    let test
    before(() => {
      test = renderer.create(<Fader visible />)
    })

    it('transitions opacity', async () => {
      test.update(<Fader visible/>)
      await milliseconds(UNTIL_SHOWING)
      expect(test.root.findByType('div'))
        .toHaveStyleRule('transition', 'opacity 250ms')
    })

    it('children have opacity:1 when shown', async () => {
      test.update(<Fader visible/>)
      await milliseconds(UNTIL_SHOWN)
      expect(test.root.findByType('div'))
        .toHaveStyleRule('opacity', '1')
    })

    it('children have opacity:0 when hiding', async () => {
      test.update(<Fader visible={false}/>)
      await milliseconds(UNTIL_SHOWING)
      expect(test.root.findByType('div'))
        .toHaveStyleRule('opacity', '0')
    })

    it('children dismounted when hidden', async () => {
      test.update(<Fader visible={false}/>)
      await milliseconds(UNTIL_SHOWN)
      expect(() => test.root.findByType('div'))
        .to.throw('No instances found with node type: "undefined"')
    })

  })
})
