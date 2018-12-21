import React from 'react'
import renderer from 'react-test-renderer'

import { expect } from 'chai'

import Slide from './slide'
import Visible from './visible'
import { CssCloner } from '../util'

import { Test } from '@benzed/dev'
import { milliseconds } from '@benzed/async'

/******************************************************************************/
// Data
/******************************************************************************/

const DELAY = 10
const UNTIL_SHOWING = 5
const UNTIL_HIDING = 5
const UNTIL_SHOWN = 15
const UNTIL_HIDDEN = 15

/******************************************************************************/
// Tests
/******************************************************************************/

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Slide', () => {

  it('is a component', () => {
    expect(() => renderer.create(<Slide/>)).to.not.throw(Error)
  })

  it('passes className to child components', () => {
    const test = renderer.create(<Slide><div/></Slide>)

    expect(test.root.findByType('div').props).to.have.property('className')
  })

  it('wraps CssCloner', () => {
    const test = renderer.create(<Slide/>)
    expect(test.root.findByType(CssCloner).type).to.be.equal(CssCloner)
    // This way I dont have to rewrite all the tests that go into CssCloner
  })

  Test.propTypes(Slide, expectError => {

    const badValues = [ 100, {}, [], Symbol('100'), true, false ]

    describe('props.from', () => {
      it('must be a string', () => {
        for (const badValue of badValues)
          expectError({ from: badValue }).to.include('Must be of type: String')
      })
    })

    describe('props.to', () => {
      it('must be a string', () => {
        for (const badValue of badValues)
          expectError({ to: badValue }).to.include('Must be of type: String')
      })
    })
  })

  describe('takes visibility context', () => {

    const Slider = ({ visible, ...props }) =>
      <Visible delay={DELAY} visible={visible}>
        <Slide {...props}>
          <div/>
        </Slide>
      </Visible>

    let test
    before(() => {
      test = renderer.create(<Slider visible />)
    })

    // TODO replace toHaveStyleRyle
    it.skip('transitions transform', async () => {
      test.update(<Slider visible/>)
      await milliseconds(UNTIL_SHOWING)
      expect(test.root.findByType('div')).toHaveStyleRule('transition', 'transform 250ms')
    })

    const values = [
      { in: 'top left', out: '-100%, -100%' },
      { in: 'top right', out: '100%, -100%' },
      { in: 'bottom right', out: '100%, 100%' },
      { in: 'bottom left', out: '-100%, 100%' },
      { in: 'top', out: '0%, -100%' },
      { in: 'left', out: '-100%, 0%' },
      { in: 'bottom', out: '0%, 100%' },
      { in: 'right', out: '100%, 0%' },
      { in: '25vw 50vh', out: '25vw, 50vh' },
      { in: '25px 50em', out: '25px, 50em' },
      { in: '50 ace', out: '0%, 0%' }
    ]

    describe('children given style.transform according to props.from when showing', () => {

      const fromValues = [
        ...values, { in: undefined, out: '0%, -100%' }
      ]
      for (const value of fromValues)
        it(`"${value.in}" === translate(${value.out})`, async () => {
          test.update(<Slider visible={false} from={value.in} />)
          await milliseconds(UNTIL_HIDDEN)

          test.update(<Slider visible from={value.in} />)
          await milliseconds(UNTIL_SHOWING)

          return expect(test.root.findByType('div').props.style)
            .to.have.property('transform', `translate(${value.out})`)
        })

      it(`uses 'to' if 'from' is not defined`, async () => {
        test.update(<Slider visible={false} to='left'/>)
        await milliseconds(UNTIL_HIDDEN)

        test.update(<Slider visible to='left' />)
        await milliseconds(UNTIL_SHOWING)

        return expect(test.root.findByType('div').props.style)
          .to.have.property('transform', `translate(-100%, 0%)`)
      })

    })

    describe('children given style.transform according to props.to when hiding', () => {

      const fromValues = [
        ...values, { in: undefined, out: '0%, 100%' }
      ]
      for (const value of fromValues)
        it(`"${value.in}" === translate(${value.out})`, async () => {
          test.update(<Slider visible to={value.in} />)
          await milliseconds(UNTIL_SHOWN)

          test.update(<Slider visible={false} to={value.in} />)
          await milliseconds(UNTIL_HIDING)

          return expect(test.root.findByType('div').props.style)
            .to.have.property('transform', `translate(${value.out})`)
        })

      it(`uses 'from' if 'to' is undefined`, async () => {
        test.update(<Slider visible from='right' />)
        await milliseconds(UNTIL_SHOWN)

        test.update(<Slider visible={false} from='right' />)
        await milliseconds(UNTIL_HIDING)

        return expect(test.root.findByType('div').props.style)
          .to.have.property('transform', `translate(100%, 0%)`)
      })
    })

    it('once shown, style is omitted', async () => {
      test.update(<Slider visible from='right' />)
      await milliseconds(UNTIL_SHOWN)

      return expect(test.root.findByType('div').props.style)
        .to.be.equal(undefined)
    })

  })
})
