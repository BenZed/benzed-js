import React from 'react'
import styled from 'styled-components'

import renderer from 'react-test-renderer'

import { expect } from 'chai'
import Styler from './styler'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Data
/******************************************************************************/

const props = {
  foo: {
    bar: 'cake'
  },
  temp: {
    value: 32,
    suffix: 'C'
  },
  theme: {
    fg: 'red',
    bg: 'white'
  }
}

/******************************************************************************/
// Tests
/******************************************************************************/

describe.only('styler', () => {

  it('is a class', () => {
    expect(Styler).to.throw('invoked without \'new\'')
  })

  describe('usage', () => {

    let PosDiv, $
    before(() => {
      $ = new Styler()
      PosDiv = styled.div`
        position: ${$.prop('absolute').mut(v => v ? 'absolute' : 'relative')};
      `
    })

    it('used to create styled-component css functions', () => {
      const div = renderer.create(<PosDiv absolute/>)
      expect(div).toHaveStyleRule('position', 'absolute')
    })

  })

  describe('instance methods', () => {

    describe('valueOf() and toString()', () => {
      let $
      before(() => {
        $ = new Styler()
        $.prop('temp', 'value')
          .mut(v => v * 2)
      })

      it('returns a function that runs stack', () => {
        const func = $.valueOf()
        expect(func(props)).to.be.equal(props.temp.value * 2)
      })

      it('function isn\'t constructed', () => {
        expect($.valueOf()).to.be.equal($.toString())
      })

    })

    describe('prop()', () => {

      it('stacks a method that returns prop at path', () => {
        const $ = new Styler()
        const getFooBar = $.prop('foo', 'bar').valueOf()

        expect(getFooBar(props)).to.be.equal('cake')
      })

      it('throws if path is undefined', () => {
        const $ = new Styler()
        expect(() => $.prop())
          .to
          .throw('Provide at least one string')
      })

      it('throws if path is not made of strings', () => {
        const mustAllBeStrings = input => expect(() => new Styler().prop(...input))
          .to
          .throw('Path arguments must all be strings.')
        for (const arr of [
          [ 'arr', 1 ], [ true, false ], [ {}, [] ]
        ])
          mustAllBeStrings(arr)
      })

      it('returns styler instance', () => {
        const $ = new Styler()
        expect($.prop('any')).to.be.equal($)
      })

    })

    describe('mut()', () => {
      it('stacks a method that mutates a value', () => {
        const $ = new Styler()
        const undefinedToYes = $.mut(v => v === undefined ? 'yes' : 'no').valueOf()
        expect(undefinedToYes(props)).to.be.equal('yes')
      })

      it('mutator gets current value as input', () => {
        const $ = new Styler()
        const doubleTemp = $.prop('temp', 'value').mut(v => v * 2).valueOf()
        expect(doubleTemp(props)).to.be.equal(props.temp.value * 2)
      })

      it('mutator gets props as second arg', () => {
        const $ = new Styler()
        const prettyTemp = $.prop('temp', 'value')
          .mut((v, p) => `${v}${p.temp.suffix}`)
          .valueOf()

        expect(prettyTemp(props)).to.be.equal(`${props.temp.value}${props.temp.suffix}`)
      })

      it('throws if mutator is not a function', () => {
        expect(() => new Styler().mut())
          .to.throw('Mutator must be a function')
      })

      it('returns styler instance', () => {
        const $ = new Styler()
        expect($.mut(v => v)).to.be.equal($)
      })
    })
  })

  describe('class methods', () => {

    describe('createInterface', () => {

      describe(`returns an object with the same api as a styler instance ` +
        `that can be used to instance stylers`, () => {

        let $

        const argsForInterfaceProps = {
          mut: [v => v],
          prop: ['path']
        }

        before(() => {
          $ = Styler.createInterface()
        })

        for (const name in argsForInterfaceProps) {

          it(`has ${name} property`, () => {
            expect($).to.have.property(name)
          })

          it(`returns a styler instance from ${name} property`, () => {
            expect($[name](...argsForInterfaceProps[name]))
              .to.be.instanceof(Styler)
          })
        }
      })

      describe(`optionally takes a theme object that extends styler with theme getters`, () => {
        let $
        before(() => {
          $ = Styler.createInterface(props.theme)
        })

        it('has a theme property', () => {
          expect($).to.have.property('theme')
        })

        it('theme property gets extended styler and calls its theme getter', () => {
          expect($.theme).to.have.property('bg')
        })

        it('calls prop() with path to theme property', () => {
          expect($.theme.bg.valueOf()(props))
            .to.be.equal(props.theme.bg)
        })
      })
    })
  })
})
