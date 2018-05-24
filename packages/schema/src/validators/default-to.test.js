import { expect } from 'chai'
import defaultTo from './default-to'
import Context from '../util/context'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('defaultTo()', () => {

  it('returns a default value if input is null or undefined', () => {
    expect(defaultTo(false)(null)).to.be.equal(false)
  })

  it('returns value otherwise', () => {
    expect(defaultTo('string')('foo')).to.be.equal('foo')
  })

  describe('config', () => {

    describe('value', () => {
      it('can be any value that isnt null or undefined', () => {
        for (const bad of [ null, undefined, NaN ])
          expect(() => defaultTo(bad)).to.throw('defaultTo config requires \'value\' property')
      })
      it('if a function, can be called to retrive value', () => {
        expect(defaultTo(() => true)()).to.be.equal(true)
      })
      it('if a function, receives validation context', () => {
        let ctx
        const sideEffect = _ctx => { ctx = _ctx; return false }
        expect(defaultTo(sideEffect)(null, new Context())).to.be.equal(false)
        expect(ctx).to.be.instanceof(Context)
      })
    })

    describe('call boolean', () => {
      const foo = () => 'bar'

      it('if false and value is function, value will not be called, returning ' +
      'the function itself', () => {
        expect(defaultTo({ value: foo, call: false })()).to.be.equal(foo)
        expect(defaultTo(foo, false)()).to.be.equal(foo)
        expect(defaultTo(foo, true)()).to.be.equal('bar')
      })

      it('defaults to auto', () => {
        expect(defaultTo(foo)()).to.be.equal('bar')
        expect(defaultTo('foo')()).to.be.equal('foo')
      })

      it('throws if false and value isn\'t function', () => {
        expect(() => defaultTo('foo', true)).to.throw('config.call cannot be ' +
        'enabled if config.value is not a function')
      })

    })
  })
})
