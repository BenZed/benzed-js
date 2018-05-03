import { expect } from 'chai'
import Schema from './schema'

import { DEFINITION } from './util'

import { typeOf, string, object, number } from './types'
import { required } from './validators'

/******************************************************************************/
// Temp
/******************************************************************************/

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('Schema', () => {

  // it('returns a validator', () => {
  //   const schema = Schema([ value => value ])
  //   expect(typeof schema).to.be.equal('function')
  // })

  describe.skip('usage', () => {
    //
    // it('creates validators that run methods on data')
    //
    // it('does not mutate input data', () => {
    //
    //   // Type
    //   class Foo {
    //     constructor (bar = 0) {
    //       this.bar = bar
    //     }
    //     copy () {
    //       return new Foo(this.bar)
    //     }
    //     equals (b) {
    //       return b instanceof Foo && b.bar === this.bar
    //     }
    //   }
    //
    //   // Validtors
    //   const cantBeZero = value => value.bar === 0
    //     ? new Error('Can\'t be zero.')
    //     : value
    //
    //   const absolute = value => new Foo(Math.abs(value.bar))
    //
    //   // Schema
    //
    //   const foo = new Schema([ typeOf(Foo), cantBeZero, absolute ])
    //
    //   // Tests
    //
    //   const input = new Foo(1)
    //   const output = foo(input)
    //
    //   expect(output).to.not.equal(input)
    //   expect(foo(new Foo(-1))).to.be.deep.equal({ bar: 1 })
    //   expect(() => foo(new Foo(0))).to.throw('Can\'t be zero.')
    //
    // })
    //
    // it('definition is stored in symbolic DEFINITION property', () => {
    //
    //   const simpleString = new Schema(string)
    //
    //   expect(simpleString).to.have.property(DEFINITION)
    //   expect(simpleString[DEFINITION]).to.be.instanceof(Array)
    //
    // })

  })

  describe.only('syntax', () => {

    it('describing an object', () => {

      const length = l => v => v && v.length <= l
        ? new Error(`length must be at least ${l}`)
        : v

      const name = Schema(string(required, length(10)), 'name')

      const author = Schema({
        name: string(required),

        metadata: object({
          name: string,
          files: number
        }, required)
      })

    })

  })

})
