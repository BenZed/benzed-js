import { expect } from 'chai'
import { set } from '../src'
import { inspect } from 'util'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('set()', () => {

  let obj1, obj2
  before(() => {
    obj1 = {}

    obj2 = set(obj1, 'key', 'value')
  })

  it('sets values on an object', () => {
    expect(obj2).to.have.property('key', 'value')
  })

  it('does not mutate original object', () => {
    expect(obj2).to.not.equal(obj1)
    expect(obj1).to.not.have.property('key')
  })

  it('creates nested paths if they do not exist', () => {
    const obj = set(obj1, 'foo', 'bar', 100)
    expect(obj.foo).to.have.property('bar', 100)
  })

  it('creates nested paths as arrays if key is numeric', () => {
    const obj = obj1::set('array', 0, 'CAKE')

    expect(obj.array).to.be.instanceof(Array)
    expect(obj.array).to.have.property(0, 'CAKE')
  })

  describe('throws if input is not an object', () => {
    for (const value of [ null, undefined, 1, true, 'string', Symbol('sup'), function cake () {} ])
      it(`throw if input is ${inspect(value)}`, () => {
        expect(() => console.log(set(value, 'foo', 'bar'))).to.throw(TypeError)
      })
  })

  it('throws if insufficient arguments', () => {

    expect(() => (set({}, 'key'))).to.throw(Error)
    expect(() => ({}::set('key'))).to.throw(Error)
    expect(() => (set({}, 'key', undefined))).to.not.throw(Error)
    expect(() => ({}::set('key', undefined))).to.not.throw(Error)

  })

  it('symbols can be used as keys', () => {

    const symbol = Symbol('private')

    const thing = {}::set(symbol, 0, 'cake')

    expect(thing).to.have.property(symbol)
    expect(thing[symbol]).to.be.instanceof(Array)
    expect(thing[symbol][0]).to.equal('cake')
  })

  describe('set.mut()', () => {
    it('is the mutable version', () => {
      const obj = {}
      const obj2 = obj::set.mut('array', 0, 'foo')

      expect(obj).to.equal(obj2)
      expect(obj).to.have.property('array')
      expect(obj.array[0]).to.be.equal('foo')
    })
  })

})
