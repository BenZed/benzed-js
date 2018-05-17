import { expect } from 'chai'

import argsToConfig from './args-to-config'
import { reverse } from '@benzed/immutable'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const EXAMPLE_LAYOUT = [{
  name: 'err',
  type: String
}]

describe('argsToConfig()', () => {

  it('is a function', () => {
    expect(argsToConfig).to.be.instanceof(Function)
  })

  describe('construct', () => {

    it('each plain object must have a non-empty string name property', () => {

      for (const badValue of [ '', undefined, null, {} ])
        expect(() => argsToConfig([
          {
            name: badValue
          }
        ])).to.throw('layout.name needs to be a non empty string')
    })

  })

  describe('layout.type', () => {

    it('each plain object must have one or more functions as types', () => {
      for (const badValue of [ [], undefined ])
        expect(() => argsToConfig([
          {
            name: 'whatever',
            type: badValue
          }
        ])).to.throw('layout.type must be defined if layout.test is not')
    })

    it('each type must be a function', () => {
      for (const badValue of [ [''], [{}] ])
        expect(() => argsToConfig([
          {
            name: 'whatever',
            type: badValue
          }
        ])).to.throw('layout.type needs to be an array of Functions')
    })

  })

  describe('layout.test', () => {

    it('throws if layout.test is defined but not a function', () => {
      expect(() => argsToConfig({ name: 'foo', type: String, test: 100 }))
        .to.throw('layout.test must be a function')
    })

    it('prevents layout.type from being required', () => {
      const layout = { name: 'ratings', count: 5, test: n => n >= 0 && n < 5 }

      expect(argsToConfig(layout)).to.not.throw(Error)

      const config = argsToConfig(layout)([ -5, 0, 1, 13, 2, 100, 3, -10, 4, 4.5 ])

      expect(config.ratings).to.be.deep.equal([ 0, 1, 2, 3, 4 ])
    })

    it('test function can be provided in layout to accompany type', () => {

      const symbolic = Symbol('symbolic')

      const configMethods = argsToConfig([
        {
          type: Function,
          test: f => symbolic in f,
          count: 1,
          name: 'symbolic-method'
        },
        {
          type: Function,
          test: f => symbolic in f === false,
          count: 1,
          name: 'regular-method'
        }
      ])

      const symMethod = () => 'sym'
      symMethod[symbolic] = true

      const regMethod = () => 'reg'

      const order1 = [ symMethod, regMethod ]
      const order2 = order1::reverse()

      // Should work regardless of order
      for (const order of [ order1, order2 ]) {
        const config = configMethods(order)
        expect(config['symbolic-method']).to.have.property(symbolic)
        expect(config['regular-method']).to.not.have.property(symbolic)
      }
    })

  })

  describe('usage', () => {

    it('returns a function', () => {
      expect(argsToConfig(EXAMPLE_LAYOUT)).to.be.instanceof(Function)
    })

    it('function parses an array into an object according to layout', () => {
      const configErr = argsToConfig({
        name: 'err',
        type: String
      })

      const args = ['You messed up.']
      const config = configErr(args)

      expect(config).to.have.property('err', args[0])
    })

    it('if count is above 1, results are placed into an array', () => {
      const configEnum = argsToConfig({
        name: 'enum',
        type: [String, Number],
        count: 4
      })

      const args = ['one', 2, 'three', 'four']
      const config = configEnum(args)
      expect(config.enum).to.deep.equal(args)
    })

    it('default value is used if none can be found in args', () => {

      const def = 'Yes'
      const configValue = argsToConfig({
        name: 'value',
        type: String,
        default: def
      })

      const args = [1, 2, 3, 4]
      const config = configValue(args)
      expect(config).to.have.property('value', def)
    })

    it('throws if required value not provided', () => {

      const configParse = argsToConfig({
        name: 'parse',
        type: Boolean,
        required: true
      })

      expect(() => configParse([])).to.throw('Boolean \'parse\' property')
    })

    describe('if args consist of a single plain object', () => {

      const configRequired = argsToConfig([
        {
          name: 'err',
          type: String,
          default: 'is Required.'
        },
        {
          name: 'enabled',
          type: Boolean,
          required: true
        }
      ])

      const args = [{ err: 'Must have.', enabled: false }]
      const config = configRequired(args)

      it('that object is used as config', () => {
        expect(config).to.have.property('err', args[0].err)
      })

      it('doesn\'t mutate input', () => {
        expect(config).to.not.equal(args[0])
      })

      it('defaults values as expected', () => {
        const config = configRequired({ enabled: true })
        expect(config).to.have.property('err', 'is Required.')
      })

      it('throws as expected', () => {
        expect(() => configRequired({})).to.throw('requires Boolean \'enabled\' property')
      })
    })
  })
})
