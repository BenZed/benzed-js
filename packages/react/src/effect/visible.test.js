import Visible, { VisibleContext, observe } from './visible'
import React from 'react'

import renderer from 'react-test-renderer'
import { expect } from 'chai'

import { Test } from '@benzed/dev'
import { milliseconds } from '@benzed/async'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Helper
/******************************************************************************/

class VisiblityChanger extends React.Component {

  state = {
    visible: true
  }

  setVisible = visible => this.setState({ visible })

  render () {
    return React.cloneElement(this.props.children, this.state)
  }
}

/******************************************************************************/
// Test
/******************************************************************************/

describe('Visible', () => {

  Test.propTypes(Visible, expectError => {

    describe('props.visible', () => {

      it('must be a boolean', () => {
        for (const badValue of [ 1000, 'string', Symbol('ok'), {}, [] ])
          expectError({ visible: badValue })
            .to.include('visible Must be of type: Boolean')

        expectError({
          visible: true,
          children: <div/>
        }).to.be.equal(null)
      })
    })

    describe('props.delay', () => {

      it('must be a number', () => {
        for (const badValue of [ 'string', Symbol('ok'), {}, [] ])
          expectError({ delay: badValue })
            .to.include('delay Must be of type: Number')

        expectError({
          delay: 250,
          children: <div/>
        }).to.be.equal(null)
      })

      // TODO implement range validator
      it('must be above zero')
    })

    describe('props.children', () => {
      it('is required', () => {
        expectError({ children: null })
          .to.include('\'children\' in <Visible/>: \'is Required.\'')
      })
    })
  })

  describe('lifecycle', () => {

    const Receiver = () =>
      <VisibleContext.Consumer>
        { visibility => <div>{visibility}</div>}
      </VisibleContext.Consumer>

    describe('initial state', () => {
      it('state.visible === props.visible', () => {
        let test = renderer.create(<Visible><div/></Visible>)
        expect(test.root.instance.state.visible).to.be.equal(true)

        test = renderer.create(<Visible visible={false}><div/></Visible>)
        expect(test.root.instance.state.visible).to.be.equal(false)
      })
    })

    describe('componentWillUnmount', () => {
      it('clears timer', async () => {
        const test = renderer.create(<Visible delay={10}><div/></Visible>)
        expect(test.root.instance.timer).to.be.equal(null)

        let timeoutCompleted = false
        test.root.instance.timer = setTimeout(() => { timeoutCompleted = true }, 10)

        test.unmount()
        await milliseconds(15)
        expect(timeoutCompleted).to.be.equal(false)
      })
    })

    describe('passes visiblity context on according to target and delay', () => {

      let setVisible, visibleState, receiverChildren
      before(() => {
        const test = renderer.create(
          <VisiblityChanger>
            <Visible delay={10}>
              <Receiver/>
            </Visible>
          </VisiblityChanger>
        )

        visibleState = () => test.toTree().rendered.instance.state.visible
        receiverChildren = () => test.toTree().rendered.rendered.rendered.props.children

        setVisible = test.root.instance.setVisible
      })

      it('shown -> hiding -> hidden', async () => {
        setVisible(true)
        await milliseconds(15)

        expect(visibleState()).to.equal(true)
        expect(receiverChildren()).to.equal('shown')

        setVisible(false)
        await milliseconds(1) // Just in case
        expect(visibleState()).to.equal(true)
        expect(receiverChildren()).to.equal('hiding')

        await milliseconds(15)
        expect(visibleState()).to.equal(false)
        expect(receiverChildren()).to.equal('hidden')
      })

      it('hidden -> showing -> shown', async () => {
        setVisible(false)
        await milliseconds(15)

        expect(visibleState()).to.equal(false)
        expect(receiverChildren()).to.equal('hidden')

        setVisible(true)
        await milliseconds(1) // Just in case
        expect(visibleState()).to.equal(false)
        expect(receiverChildren()).to.equal('showing')

        await milliseconds(15)
        expect(visibleState()).to.equal(true)
        expect(receiverChildren()).to.equal('shown')
      })
    })
  })
})

Test.optionallyBindableMethod(observe, _observe => {
  it('is exported and attached to Visibile', () => {
    expect(observe).to.be.instanceof(Function)
    expect(observe).to.be.equal(Visible.observe)
  })

  it('returns a component', () => {
    const Div = _observe('div')
    expect(Div).to.be.instanceof(Function)
    expect(() => renderer.create(<Div/>)).to.not.throw(Error)
  })

  describe('created component', () => {

    let test, setVisible, getEffect, getEffectRWH
    before(() => {
      const Effect = _observe(({ visibility }) => <div>{visibility}</div>)
      const EffectRWH = _observe(({ visibility }) => <div>{visibility}</div>, true)

      test = renderer.create(
        <VisiblityChanger>
          <Visible delay={10}>
            <Effect/>
            <EffectRWH/>
          </Visible>
        </VisiblityChanger>
      )

      setVisible = test.root.instance.setVisible
      getEffect = () => test.toTree().rendered.rendered[0].rendered
      getEffectRWH = () => test.toTree().rendered.rendered[1].rendered
    })

    it('observes visibility', async () => {
      setVisible(true)
      await milliseconds(15)
      expect(getEffect().props).to.have.property('visibility', 'shown')

      setVisible(false)
      await milliseconds(5)
      expect(getEffect().props).to.have.property('visibility', 'hiding')
    })

    it('dismounts children on visibility === "hidden" if renderHidden == false', async () => {
      setVisible(false)
      await milliseconds(15)
      expect(getEffect()).to.be.equal(null)
    })

    it('does not dismount children on visibility === "hidden" if renderHidden == true', async () => {
      setVisible(false)
      await milliseconds(15)
      expect(getEffectRWH().props).to.have.property('visibility', 'hidden')
    })

  })
})
