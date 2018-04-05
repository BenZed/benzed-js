import { expect } from 'chai'
import { get } from '../src'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const getters = {}

getters.argument = (object, keys, value) => get(object, keys, value)
getters.argument.mut = (object, keys, value) => get.mut(object, keys, value)

getters.bound = (object, keys, value) => object::get(keys, value)
getters.bound.mut = (object, keys, value) => object::get.mut(keys, value)

const describer = {}

describer.argument = `set(obj, key, value)`
describer.bound = `obj::set(key, value)`

describe('get()', () => {

  for (const method in getters) {

    const getter = getters[method]

    describe(`${method} syntax: ${describer[method]}`, () => {

      it('gets values in objects via a path', () => {

        const obj = { key: 'value' }

        expect(getter(obj, 'key'))
          .to
          .equal('value')
      })

      it('returns copies of gotten values', () => {

        const obj = {
          nested: {
            foo: 'bar'
          }
        }

        const nested = getter(obj, 'nested')
        expect(nested).to.deep.equal(obj.nested)
        expect(nested).to.not.equal(obj.nested)

      })

      describe('get.mut', () => {

        it('is the mutable version', () => {

          const obj = {
            nested: {
              foo: 'bar'
            }
          }

          const nested = getter.mut(obj, 'nested')
          expect(nested).to.deep.equal(obj.nested)
          expect(nested).to.equal(obj.nested)

        })

      })

    })

  }

})
