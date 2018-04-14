import { expect } from 'chai'
import Schema from './schema'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Schema', () => {

  it('is a class', () => {
    expect(() => Schema())
      .to.throw('cannot be invoked without \'new\'')
  })

})
