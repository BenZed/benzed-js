import { expect } from 'chai'
import Schema from './schema'
import is from 'is-explicit'

import { inspect } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Schema', () => {

  it('returns a validator', () => {
    const schema = Schema([ value => value ])
    expect(typeof schema).to.be.equal('function')
  })

  describe('usage', () => {

    it('creates validators that run methods on data', () => {

      const type = Type => value => is(value, Type)
        ? value
        : new Error(`Must be of type: ${Type.name}`)

      const message = new Schema({

        body: type(String),
        author: {
          name: type(String),
          id: type(Number)
        }
      })

      expect(() => message({ body: null })).to.throw('Must be of type: String')

    })

  })

})
