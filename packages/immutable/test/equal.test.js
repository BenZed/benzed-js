import { expect } from 'chai'
import { equals } from '../src'
import { inspect } from 'util'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('equals()', () => {

  describe('returns true if two operands are "value-equal"', () => {

    describe('works on primitives', () => {

      const SYMBOL = Symbol('c')

      const primitives = [
        [ -1, -1, true ],
        [ -1, 1, false ],
        [ Infinity, -Infinity, false ],
        [ -Infinity, -Infinity, true ],
        [ Infinity, Infinity, true ],
        [ true, true, true ],
        [ true, false, false ],
        [ false, false, true ],
        [ 'true', true, false ],
        [ null, null, true ],
        [ null, undefined, false ],
        [ undefined, undefined, true ],
        [ NaN, NaN, true ],
        [ Symbol('a'), Symbol('b'), false ],
        [ SYMBOL, SYMBOL, true ],
        [ 'string', 'string', true ],
        [ 'string', 'long-string', false ]
      ]

      for (const [ a, b, output ] of primitives)
        it(`${inspect(a)} equals ${inspect(b)} : ${output}`, () => {
          expect(a::equals(b)).to.equal(output)
        })

    })

  })

})
