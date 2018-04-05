import { expect } from 'chai'
import { toCamelCase } from '../src'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const syntax = {
  argument: a => toCamelCase(a),
  bound: a => a::toCamelCase()
}

describe('toCamelCase()', () => {

  for (const method in syntax) {

    const func = syntax[method]

    describe(`${method} syntax:`, () => {


    })

  }

})
