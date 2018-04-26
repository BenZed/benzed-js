import { expect } from 'chai'

import { validate, createContext } from './validate'
import normalizeDefinition from './util/normalize-definition'

import { SELF } from './util/symbols'
import ValidationError from './util/validation-error'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Fake Validators
/******************************************************************************/

const clamp = value => value > 1 ? 1 : value < 0 ? 0 : value

const opposite = b => b === true ? false : b

const plainObject = value => value || {}

const upperCase = value => value.toUpperCase()

const fakeDelay = value => new Promise(resolve => setTimeout(() => resolve(value), 1))

/******************************************************************************/
//
/******************************************************************************/

function run (func, data, ...args) {

  const funcs = normalizeDefinition(func)
  const context = createContext(data, args, [])

  return validate(funcs, data, context)
}

describe('validate()', () => {

  it('returns output from definitions, data and context', () => {
    const num = run(clamp, 1.2)
    expect(num).to.be.equal(1)
  })

  describe('definitions', () => {

    describe('if an array of functions', () => {
      it('chains the input data into each function, returning the result', () => {

        const plus1 = v => v + 1
        const squared = v => v * v

        const value = run([ plus1, plus1, squared ], 10)

        expect(value).to.equal(144)

      })

      it('if the result is an error, wraps it in a ValidationError and throws', () => {
        let err
        try {
          run([ () => { throw new Error('you fucked up') } ])
        } catch (e) {
          err = e
        }
        expect(err).to.be.instanceof(ValidationError)
        expect(err.path).to.be.deep.equal([])
      })

      it('resolves promise values into nested validate calls', async () => {
        const value = await run([fakeDelay, opposite], true)
        expect(value).to.be.equal(false)
      })

      it('promise rejections get cast to ValidationErrors', async () => {
        let err
        try {
          await run([ fakeDelay, () => { throw new Error('you fucked up') } ])
        } catch (e) {
          err = e
        }
        expect(err).to.be.instanceof(ValidationError)
      })

    })

    describe('if a plain object', () => {
      it('validate is not called on each object key if input is not object', () => {
        const fobj = {
          foo: () => new Error('>:(')
        }

        expect(() => run(fobj, null)).to.not.throw(Error)
      })
      it('calls SELF on object before sub properties', () => {

        const fobj = {
          foo: [ v => v || 0, clamp ],
          [SELF]: [ v => v || {} ]
        }

        expect(run(fobj, null)).to.deep.equal({ foo: 0 })
      })

      it('undefined values are not added to output object', () => {
        const fobj = {
          foo: clamp,
          bar: clamp,
          cake: clamp
        }
        expect(run(fobj, { foo: 2 })).to.deep.equal({ foo: 1 })
      })

      it('resolves promise values into nested validate calls', async () => {
        const fobj = {
          [SELF]: [ fakeDelay, plainObject ],
          code: [ v => v || 'empty', fakeDelay, upperCase ],
          priority: [ v => v || 0, fakeDelay, clamp ]
        }
        const result = await run(fobj, null)
        expect(result).to.deep.equal({
          code: 'EMPTY',
          priority: 0
        })
      })
    })

  })

  describe('context', () => {

    it('holds the path of the current validation from the original input', () => {
      const good = v => v
      const bad = () => new Error('Bad.')

      const fobj = {
        foo: {
          bar: good
        },
        cake: {
          town: bad
        }
      }

      let err
      try {
        run(fobj, { foo: { bar: true }, cake: { town: false } })
      } catch (e) {
        err = e
      }

      expect(err.path).to.be.deep.equal(['cake', 'town'])
    })

    it('holds arguments supplied with the original validate() call', () => {
      let args
      const test = (v, ctx) => {
        args = ctx.args
        return v
      }

      run(test, true, 'foobar')
      expect(args).to.deep.equal(['foobar'])
    })

    it('holds the original data supplied to validate()', () => {
      let original

      const neg = v => !v

      const test = (v, ctx) => {
        original = ctx.data
        return v
      }

      run([ neg, test ], true)
      expect(original).to.deep.equal(true)
    })

  })

})
