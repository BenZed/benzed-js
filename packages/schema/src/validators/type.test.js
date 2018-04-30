import { expect } from 'chai'

import type from './type'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const TYPE_TESTS = [
  {
    type: Number,
    err: 'foo',
    cast: [{ in: '123', out: 123 }]
  },
  {
    type: Boolean,
    err: NaN,
    cast: [{ in: 123, out: '123' }]
  },
  {
    type: String,
    err: Symbol('one'),
    cast: [{ in: 123, out: '123' }]
  }
]

describe('type()', () => {
  //
  // for (const data of TYPE_TESTS) {
  //   const test = type(data.type)
  //
  //   describe(`${data.type.name}`, () => {
  //
  //     it('returns error if value can not be casted to type', () => {
  //       const error = test(data.err)
  //       expect(error).to.be.instanceof(Error)
  //       expect(error).to.have.property('message', `Must be of type: ${data.type.name}`)
  //     })
  //
  //     describe('casts to type if possible', () => {
  //       for (const convert of data.cast)
  //         it(`${convert.in} >> ${convert.out}`, () => {
  //           expect(test(convert.in)).to.be.equal(convert.out)
  //         })
  //     })
  //
  //   })
  //
  // }

})
