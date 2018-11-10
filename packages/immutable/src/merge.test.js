import { expect } from 'chai'

import _merge from './merge'
import copy from './copy'
import { $$copy } from './symbols'

import Test, { inspect } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(_merge, merge => {

  describe('deep assigns one value onto another', () => {

    const aObj = { a: 'b', d: 1 }
    const bObj = { a: { b: 'c' } }
    const result = { a: { b: 'c' }, d: 1 }

    it(`merge({ a: 'b', d: 1 }, { a: { b: 'c' } }) >> { a: { b: 'c' }, d: 1 }`, () => {
      expect(merge(aObj, bObj)).to.deep.equal(result)
    })

  })

  it('does not mutate input', () => {

    const a = { a: {}, b: {} }

    const a2 = copy(a)

    const b = merge(a2, a2)
    expect(b).to.deep.equal(a)

    // proves a2 did not change by merge
    expect(a2).to.deep.equal(a)

    // proves deep references are also unique
    expect(b.a).to.not.equal(a2.a)
    expect(b.b).to.not.equal(a2.b)
  })

  it('only merges plain objects')

  it('does not use needless recursive copies', () => {

    let count = 0

    class CopySpy {
      constructor (obj) {
        for (const key in obj)
          this[key] = typeof obj[key] === 'object'
            ? new CopySpy(obj[key])
            : obj[key]
      }

      [$$copy] () {
        count++
        return new CopySpy(this)
      }
    }

    const spy = new CopySpy({
      a: { b: { c: 'd' } },
      a1: { b2: { c2: 'd2' } }
    })

    merge(spy, spy)

    expect(count).to.equal(2)

  })

  describe('right hand operators take precedence', () => {
    const PRIMITIVES = [ 0, 1, -1, '', 'str', true, false ]

    for (const a of [ {} ])
      for (const b of PRIMITIVES)
        it(inspect`merge(${a},${b}) >> ${b}`,
          () => expect(merge(a, b)).to.equal(b))
  })

})
