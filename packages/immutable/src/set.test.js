import { expect } from 'chai'
import { set } from '../src'
import { inspect } from 'util'

import Test from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(set, setter => {

  let obj1, obj2
  before(() => {
    obj1 = {}

    obj2 = setter(obj1, 'key', 'value')
  })

  it('sets values on an object', () => {
    expect(obj2).to.have.property('key', 'value')
  })

  it('does not mutate original object', () => {
    expect(obj2).to.not.equal(obj1)
    expect(obj1).to.not.have.property('key')
  })

  it('creates nested paths if they do not exist', () => {
    const obj = setter(obj1, ['foo', 'bar'], 100)
    expect(obj.foo).to.have.property('bar', 100)
  })

  it('creates nested paths as arrays if key is numeric', () => {
    const obj = setter(obj1, [ 'array', 0 ], 'CAKE')

    expect(obj.array).to.be.instanceof(Array)
    expect(obj.array).to.have.property(0, 'CAKE')
  })

  it('overwrites nested paths', () => {
    const obj = {
      foo: [{ bar: null }]
    }

    expect(setter(obj, ['foo', 0, 'bar', 'baz'], 'cake'))
      .to.deep.equal({ foo: [ { bar: { baz: 'cake' } } ] })
  })

  it('sets values in arrays', () => {

    const arr = [ 0, 1, 2, 3, 4 ]

    const arr2 = setter(arr, arr.length, 5)
    const arr3 = setter(arr2, 0, 6)

    expect(arr2).to.not.equal(arr)
    expect(arr2).to.deep.equal([ ...arr, 5 ])
    expect(arr3).to.not.equal(arr2)
    expect(arr3).to.deep.equal([ 6, 1, 2, 3, 4, 5 ])

  })

  describe('throws if input is not an object', () => {
    for (const value of [ null, undefined, 1, true, 'string', Symbol('sup'), function cake () {} ])
      it(`throw if input is ${inspect(value)}`, () => {
        expect(() => console.log(set(value, 'foo', 'bar'))).to.throw(TypeError)
      })
  })

  it('symbols can be used as keys', () => {

    const symbol = Symbol('private')

    const thing = setter({}, [ symbol, 0 ], 'cake')

    expect(thing).to.have.property(symbol)
    expect(thing[symbol]).to.be.instanceof(Array)
    expect(thing[symbol][0]).to.equal('cake')
  })

})

Test.optionallyBindableMethod(set.mut, setMutable => {
  it('is the mutable version', () => {
    const obj = {}
    const obj2 = setMutable(obj, [ 'array', 0 ], 'foo')

    expect(obj).to.equal(obj2)
    expect(obj).to.have.property('array')
    expect(obj.array[0]).to.be.equal('foo')
  })
}, 'set.mut')
