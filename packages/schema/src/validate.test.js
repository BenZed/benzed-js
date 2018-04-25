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
  const context = createContext(funcs, data, args)

  return validate(funcs, data, context)
}

describe('validate()', () => {

  it('returns output from definitions, data and context', () => {

    const num = run(clamp, 1.2)

    expect(num).to.be.equal(1)

  })

  describe('definitions', () => {

    describe('if an array of functions', () => {
      it('chains the input data into each function, returning the result')

      it('if the result is an error, wraps it in a ValidationError and throws')
      it('skips remaining functions is result is SKIP symbol')
      it('does not return SKIP symbol')
      it.only('resolves promise values into nested validate calls', async () => {
        const value = await run([fakeDelay, opposite], true)
        expect(value).to.be.equal(false)
      })

      it.only('promise rejections get cast to ValidationErrors', async () => {
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
      it('recursively calls validate() on each object key')
      it('validate is not called on each object key if input is not object')
      it('calls SELF on object before sub properties')
      it('returns a plain object output for each key')
      it('undefined values are not added to output object')
      it.only('resolves promise values into nested validate calls', async () => {

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

    it('holds the path of the current validation from the original input')
    it('path auto increments for each nested object')
    it('holds arguments supplied with the original validate() call')
    it('holds the original data supplied to validate()')

  })

  describe('output', () => {

  })

})
