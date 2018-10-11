import { expect } from 'chai'
import Schema from './schema'

import {
  StringType, BooleanType, NumberType, ArrayType, ObjectType, SpecificType,
  GenericType, EnumType, MultiType
} from './types'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/* eslint-disable react/react-in-jsx-scope */
// @jsx Schema.create

describe('Schema', () => {

  it('is a class', () => {
    expect(() => Schema()).to.throw('invoked without \'new\'')
  })

  describe('Schema.create', () => {
    it('is an alias for new Schema', () => {
      const schema = Schema.create(String, {}, null)
      expect(schema).to.be.instanceof(Schema)
    })

    it('works with jsx', () => {
      const schema = <string />
      expect(schema).to.be.instanceof(Schema)
    })
  })

  describe('new Schema()', () => {

    class Foo { }

    class Bar { }

    describe('type argument', () => {
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
          [ 'any', GenericType ],
          [ 'oneOf', EnumType ],
          [ 'oneOfType', MultiType ],
          [ 'map', SpecificType ],
          [ 'set', SpecificType ]
        ])
        for (const [key, value] of match)
          it(`${key} becomes ${value.name}`, () => {
            const schema = new Schema(key, {}, null)
            expect(schema.schemaType.constructor).to.be.equal(value)
          })
      })

      it('root type constructor placed in .type field', () => {
        const schema = <string />
        expect(schema.type).to.be.equal(String)
      })

      describe('null and undefined resolve to generic type', () => {
        const match = new Map([
          [ null, GenericType ],
          [ undefined, GenericType ]
        ])
        for (const [key, value] of match)
          it(`${key} becomes ${value.name}`, () => {
            const schema = new Schema(key, {}, null)
            expect(schema.schemaType.constructor).to.be.equal(value)
          })
      })

      describe('Type constructors resolve to corresponding schema types', () => {
        const match = new Map([
          [ String, StringType ],
          [ Boolean, BooleanType ],
          [ Number, NumberType ],
          [ Array, ArrayType ],
          [ Object, ObjectType ],
          [ Symbol, SpecificType ],
          [ Map, SpecificType ],
          [ Set, SpecificType ]
        ])
        for (const [key, value] of match)
          it(`${key.name} becomes ${value.name}`, () => {
            const schema = new Schema(key, {}, null)
            expect(schema.schemaType.constructor).to.be.equal(value)
          })
      })

      describe('Custom type constructors resolve to specific type', () => {

        const match = new Map([
          [ Foo, SpecificType ],
          [ Bar, SpecificType ]
        ])

        for (const [key, value] of match)
          it(`${key.name} becomes ${value.name}`, () => {
            const schema = new Schema(key, {}, null)
            expect(schema.schemaType.constructor).to.be.equal(value)
          })
      })

      describe('Custom Array types get cast to ArrayType', () => {

        class MyArray extends Array { }

        const match = new Map([
          [ MyArray, ArrayType ]
        ])

        for (const [key, value] of match)
          it(`${key.name} becomes ${value.name}`, () => {
            const schema = new Schema(key, {}, null)
            expect(schema.schemaType.constructor).to.be.equal(value)
          })
      })

      describe('custom schema types are used as is', () => {

        class FooType extends SpecificType {
          constructor () {
            super(Foo)
          }
        }

        it(`FooType becomes FooType`, () => {
          const schema = new Schema(FooType, {}, null)
          expect(schema.schemaType.constructor).to.be.equal(FooType)
        })
      })

      describe('anything other than null, undefined a string or a function throws', () => {
        for (const badValue of [ {}, [ 0, 1, 2 ], new SpecificType(Boolean), 100, false, true, Symbol('lol') ])
          it(`${String(badValue)}`, () => {
            expect(() => new Schema(badValue))
              .to.throw('type argument must be null, a string or a function')
          })
      })
    })

    describe('prop argument', () => {
      it('props are resolved')
    })
  })

  describe('new Schema.validate()', () => {
    describe('simple examples', () => {

      it('<string/> validates strings', () => {
        expect(<string/>.validate('hello'))
          .to.be.equal('hello')
      })

      it('<string/> allows null or undefined', () => {
        for (const nil of [null, undefined])
          expect(<string/>.validate(nil))
            .to.be.equal(nil)
      })

      it('<string required /> does not allow null or undefined', () => {
        for (const nil of [null, undefined])
          expect(() => <string required />.validate(nil))
            .to.throw('is required.')
      })

      it('<string /> does not allow non string data', () => {
        expect(() => <string/>.validate(100))
          .to.throw('must be of type: String')
      })

      it('<bool/> or <boolean/> validates bools', () => {
        expect(() => <bool/>.validate(50))
          .to.throw('must be of type: Boolean')

        expect(<boolean/>.validate(false))
          .to.be.equal(false)
      })

      it('<number/> validates numbers', () => {
        expect(<number />.validate(50))
          .to.be.equal(50)
      })
    })
  })
})
