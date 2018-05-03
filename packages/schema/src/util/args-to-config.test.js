import { expect } from 'chai'

import argsToConfig from './args-to-config'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const EXAMPLE_LAYOUT = [{
  name: 'err',
  type: String
}]

describe('argsToConfig', () => {

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

    it('each plain object must have one or more functions as types', () => {
      for (const badValue of [ [], undefined, [''], [{}] ])
        expect(() => argsToConfig([
          {
            name: 'whatever',
            type: badValue
          }
        ])).to.throw('layout.type needs to be an array of Functions')
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
