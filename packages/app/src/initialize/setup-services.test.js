import { expect } from 'chai'
import setupServices from './setup-services'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('setupServices()', () => {

  it('must be bound to app', () => {
    expect(setupServices).to.throw('Cannot destructure property `feathers` of \'undefined\'')
  })

})
