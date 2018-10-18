import { expect } from 'chai'
import propToConfig from './prop-to-config'
import is from 'is-explicit'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('propToConfig', () => {

  it('is a function', () => {
    expect(propToConfig).to.be.instanceof(Function)
  })

  describe('takes a layout', () => {

    const simpleLayout = [
      {
        name: 'msg',
        test: is.string,
        default: 'Default message.',
        required: true
      }
    ]

    it('returns a function with just a layout argument', () => {
      const output = propToConfig(simpleLayout)
      expect(is.func(output)).to.be.equal(true)
    })

    it('returns a config with a layout and prop argument', () => {
      const config = propToConfig(simpleLayout, undefined)
      expect(config).to.be.deep.equal({
        msg: 'Default message.'
      })
    })
  })

  describe('layout argument', () => {

    it('must be an array of plain objects', () => {

      class Foo { }

      for (const badValue of [ undefined, null, new Foo(), 100, true, 'string' ])
        expect(() => propToConfig(badValue))
          .to.throw('each layout must be a plain object')
    })

    it('must have at least one layout object', () => {
      expect(() => propToConfig([]))
        .to.throw('must be at least one layout object')
    })

    it('each layout object must have a name property', () => {
      for (const badName of [ null, 100, true ])
        expect(() => propToConfig({ name: badName }))
          .to.throw('each layout must have a name')
    })

    it('each layout name cannot be empty', () => {
      expect(() => propToConfig({ name: '' }))
        .to.throw('layout names must not be empty')
    })

    it('default values, if provided, must pass validation and tests', () => {
      expect(() => propToConfig({
        name: 'whoops',
        test: is.string,
        default: 100
      })).to.throw('default layout values must pass test')
    })

    it('each layout object must have at least one function in test', () => {
      for (const badTest of [ null, [], true, 'not-a-function' ])
        expect(() => propToConfig({ name: 'message', test: badTest }))
          .to.throw('each layout must have at least one test function')
    })

    it('only keys defined by the layout should be in the config', () => {
      expect(propToConfig({
        name: 'value',
        test: is.defined
      }, { value: 1, foo: 1, bar: 2 })).to.be.deep.equal({ value: 1 })
    })

  })

  describe('converting props to a config object', () => {

    let testConfig
    before(() => {
      testConfig = propToConfig([{
        name: 'err',
        test: is.string,
        default: 'Invalid comment.'
      }, {
        name: 'score',
        test: is.number,
        validate: num => num <= 5
          ? num
          : throw new Error('Must be 5 or below'),
        required: true,
        default: 0
      }, {
        name: 'fallback',
        test: is.bool,
        default: false
      }])
    })

    it('works with undefined or null', () => {
      for (const nil of [ null, undefined ])
        expect(testConfig(nil))
          .to.be.deep.equal({
            err: 'Invalid comment.',
            score: 0,
            fallback: false
          })
    })

    it('works with array inputs', () => {

      const err = 'Bad comment.'
      const score = 4
      const fallback = true

      // order doesn't matter
      for (const order of [
        [err, score, fallback],
        [score, fallback, err],
        [fallback, err, score]
      ])
        expect(testConfig(order))
          .to.be.deep.equal({
            err,
            score,
            fallback
          })
    })

    it('throws if values don\'t pass validation', () => {
      expect(() => testConfig(10))
        .to.throw('Must be 5 or below')
    })

    it('works with config objects', () => {
      expect(testConfig({
        err: 'No good.',
        score: 0
      })).to.be.deep.equal({
        err: 'No good.',
        score: 0,
        fallback: false
      })
    })

    it('config values throw if they dont pass test', () => {
      expect(() => testConfig({
        score: true
      })).to.throw('\'score\' is invalid.')
    })

    it('throws if required values without defaults arn\'t provided', () => {

      const modeConfig = propToConfig({
        name: 'mode',
        test: is.string,
        required: true
      })

      for (const bad of [ { mode: undefined }, [100], false, true ])
        expect(() => modeConfig(bad))
          .to.throw('\'mode\' is required.')
    })

    describe('if count is higher than 1', () => {

      let enumConfig
      before(() => {
        enumConfig = propToConfig({
          name: 'values',
          count: 5,
          test: is.string,
          default: 'one',
          required: true
        })
      })

      it('values get wrapped in array', () => {
        const config = enumConfig([
          'one', 'two', 3, 'three'
        ])
        expect(config).to.be.deep.equal({
          values: [ 'one', 'two', 'three' ]
        })
      })

      it('defaults are wrapped in arrays as well', () => {
        expect(enumConfig())
          .to.be.deep.equal({
            values: ['one']
          })
      })

      it('throws if required and value is an empty array', () => {
        const enumConfigNoDefault = propToConfig({
          name: 'values',
          count: 5,
          test: is.string,
          required: true
        })

        expect(() => enumConfigNoDefault())
          .to.throw('\'values\' is required.')
      })
    })

  })

})
