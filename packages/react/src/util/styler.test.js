import React from 'react'
import styled from 'styled-components'

import renderer from 'react-test-renderer'

import { expect } from 'chai'
import Styler from './styler'

import { set } from '@benzed/immutable'
import Color from '../themes/color'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Data
/******************************************************************************/

const props = {
  foo: {
    bar: 'cake'
  },
  hidden: false,
  visibility: 'visible',
  temp: {
    value: 32,
    suffix: 'F'
  },
  theme: {
    fg: new Color('white'),
    bg: new Color('black'),
    brand: {
      primary: new Color('blue'),
      secondary: new Color('cyan')
    }
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

    for (const alterColor of ['fade', 'lighten', 'darken'])
      describe(`${alterColor}()`, () => {
        it(`${alterColor}s the current value if it's a color`, () => {
          const $ = new Styler()
          const fadePrimary = $
            .prop('theme', 'brand', 'primary')[alterColor](0.5)
            .valueOf()

          expect(fadePrimary(props))
            .to.be.equal(props.theme.brand.primary[alterColor](0.5).toString())
        })
        it('does not alter current value if it is not a color', () => {
          const $ = new Styler()
          const doNothingToCake = $
            .prop('foo', 'bar')[alterColor](0.5)
            .valueOf()

          expect(doNothingToCake(props))
            .to.be.equal('cake')
        })
        it('returns styler instance', () => {
          const $ = new Styler()
          expect($[alterColor](0.5)).to.be.equal($)
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

    describe('set()', () => {

      it('adds a method onto the stack that sets a value', () => {

        const $ = new Styler()
        const setValue = $.set('value').valueOf()

        expect(setValue(props)).to.be.equal('value')
      })

      it('returns styler instance', () => {

        const $ = new Styler()
        expect($.set('value')).to.be.equal($)
      })

    })

    describe('if() & else', () => {

      it('enables rudimentary flow control in styled functions', () => {
        const $ = new Styler()

        /* eslint-disable indent */
        const tempType = $
          .if((v, p) => p.temp.suffix !== 'C')
            .set('farenheight')
          .else
            .set('celsius')
          .valueOf()
        /* eslint-enable */

        expect(tempType(props)).to.be.equal('farenheight')
      })

      it('throws if not provided a function', () => {
        const $ = new Styler()

        expect(() => $.if(100)).to.throw('must be a predicate function')
      })

      it('if blocks can be chained', () => {

        const $ = new Styler()

        const chained = $.if((v, p) => p.hidden)
          .set('is-hidden')
          .else.if((v, p) => p.foo.bar === 'cake')
          .set('is-cake')
          .else.set('is-neither-hidden-or-cake')
          .valueOf()

        expect(chained(props)).to.be.equal('is-cake')

        const hProps = props::set('hidden', true)
        expect(chained(hProps))
          .to.be.equal('is-hidden')

        const nProps = props::set(['foo', 'bar'], false)
        expect(chained(nProps))
          .to.be.equal('is-neither-hidden-or-cake')

      })

      it('if blocks can be nested', () => {

        const $ = new Styler()

        /* eslint-disable indent */
        const nested = $
          .if((v, p) => p.hidden)
            .if((v, p) => p.foo.bar)
              .set('is-hidden-cake')
            .else
              .set('is-hidden-no-cake')
          .else
            .set('is-not-hidden')
          .valueOf()

        expect(nested(props))
          .to.be.equal('is-not-hidden')

        const ncProps = props
          ::set(['foo', 'bar'], false)
          ::set('hidden', true)

        expect(nested(ncProps))
          .to.be.equal('is-hidden-no-cake')

        const hcprops = props::set('hidden', true)
        expect(nested(hcprops))
          .to.be.equal('is-hidden-cake')
      })

      it('else cannot be called without a preceding if', () => {
        expect(() => new Styler().else).to.throw('Can\'t stack else, must come after if.')
      })

    })

    describe('or', () => {

      it('terminates stack unless value is null or undefined', () => {
        const $ = new Styler()
        const hiddenOr = $.set(null)
          .or.prop('hidden')
          .or.prop('temp', 'suffix')
          .valueOf()

        expect(hiddenOr(props)).to.be.equal(false)
      })

      it('mixes well with if and else', () => {
        const $ = new Styler()
        const opacity = $
          .ifProp('hidden')
            .prop('faded').or.set(0)
          .else.set(1)
          .valueOf()

        expect(opacity(props))
          .to.be.equal(1)

        expect(opacity(props::set('hidden', true)))
          .to.be.equal(0)
      })

      it('returns styler', () => {
        const $ = new Styler()
        expect($.prop('hidden').or).to.be.equal($)
      })

    })

    describe('ifProp', () => {
      it('shortcut to if, with predicate set to value of prop at path')
    })

    describe('ifBranded', () => {
      it('shortcut to if, with predicate set to true if prop.brand has a value that matches a key in prop.theme.brand')
    })
  })

  describe('instance properties', () => {
    describe('branded', () => {

      it('stacks a method that returns props.theme.brand[props.brand]', () => {
        const $ = new Styler()

        const getBranded = $.branded.valueOf()
        expect(getBranded)
          .to
          .be
          .instanceof(Function)

        const bprops = props::set('brand', 'primary')
        expect(getBranded(bprops))
          .to
          .be
          .equal(props.theme.brand.primary.toString())
      })
    })
  })

  describe('class methods', () => {

    describe('createInterface', () => {

      describe(`returns an object with the same api as a styler instance ` +
        `that can be used to instance stylers`, () => {

        let $

        const argsForInterfaceFuncs = {
          mut: [v => v],
          prop: ['path']
        }

        const interfaceProps = [
          'branded'
        ]

        before(() => {
          $ = Styler.createInterface()
        })

        for (const name in argsForInterfaceFuncs) {

          it(`has ${name} property`, () => {
            expect($).to.have.property(name)
          })

          it(`returns a styler instance from ${name} property`, () => {
            expect($[name](...argsForInterfaceFuncs[name]))
              .to.be.instanceof(Styler)
          })
        }

        for (const name of interfaceProps) {
          it(`has ${name} property`, () => {
            expect($).to.have.property(name)
          })
          it(`returns a styler instance from ${name} property`, () => {
            expect($[name])
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
            .to.be.equal(`${props.theme.bg}`)
        })
      })
    })
  })
})
