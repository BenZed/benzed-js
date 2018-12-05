import { assert } from 'chai'
import createValidator from '../create-validator' // eslint-disable-line no-unused-vars
import { Test } from '@benzed/dev'
import isSchema from './is-schema'

/* @jsx createValidator */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(isSchema, isSchema => {

  it('returns true if input is a schema', () => {
    assert(isSchema(<object/>), 'is not a schema')
  })

  it('returns false otherwise', () => {
    for (const bad of [ () => {}, 'yo', true, false, 'hey' ])
      assert(!isSchema(bad), `${bad} should not be a schema`)
  })

})
