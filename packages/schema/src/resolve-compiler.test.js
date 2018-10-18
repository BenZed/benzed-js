import { expect } from 'chai'

import resolveCompiler from './resolve-compiler'
import {
  StringType, SpecificType, NumberType, BooleanType, Type, ArrayType,
  ObjectType, ValueType, MultiType
} from './types'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('resolveCompiler', () => {

  describe('strings resolve to corresponding schema types', () => {

    const match = new Map([
      [ 'string', StringType ],
      [ 'boolean', BooleanType ],
      [ 'bool', BooleanType ],
      [ 'number', NumberType ],
      [ 'array', ArrayType ],
      [ 'arrayOf', ArrayType ],
      [ 'object', ObjectType ],

      [ 'symbol', SpecificType ],
      [ 'map', SpecificType ],
      [ 'set', SpecificType ],
      [ 'any', Type ],
      [ null, Type ]

    ])

    for (const [key, value] of match)
      it(`${key} becomes ${value.name}`, () => {
        const type = resolveCompiler(key)
        expect(type?.constructor).to.be.equal(value)
      })

    const matchesThatRequireChildren = new Map([
      [ 'oneOf', ValueType ],
      [ 'oneOfType', MultiType ]
    ])

    for (const [key, value] of matchesThatRequireChildren)
      it(`${key} becomes ${value.name}`, () => {
        const type = resolveCompiler(key)
        expect(type?.constructor).to.be.equal(value)
      })
  })

  describe('instanceable types resolve to corresponding schema types', () => {

    class Foo { }

    function Bar () { }

    const match = new Map([

      [ String, StringType ],
      [ Map, SpecificType ],
      [ Set, SpecificType ],
      [ Boolean, BooleanType ],
      [ Number, NumberType ],
      [ Array, ArrayType ],
      [ Object, ObjectType ],

      [ Foo, SpecificType ],
      [ Bar, SpecificType ]

    ])

    for (const [key, value] of match)
      it(`${key.name} becomes ${value.name}`, () => {
        const type = resolveCompiler(key)
        expect(type?.constructor).to.be.equal(value)
      })

  })

  it('returns custom compilers', () => {
    const Add = props => value => value + props.amount
    expect(resolveCompiler(Add)).to.be.equal(Add)
  })

  it('can be customized')
})
