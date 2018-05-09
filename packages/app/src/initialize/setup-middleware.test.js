import { expect } from 'chai'
import setupMiddleware from './setup-middleware'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('setupMiddleware', () => {

  it('must be bound to app', () => {
    expect(setupMiddleware)
      .to
      .throw('Cannot destructure property `feathers` of \'undefined\'')
  })

  it('does nothing if rest is not enabled')

  it('uses class defined middleware, if defined')

  it('serves rest.public as static')

  it('sets up error handler middleware')

})
