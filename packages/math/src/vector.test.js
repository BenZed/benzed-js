import { expect } from 'chai'

import Vector from './Vector'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Vector', () => {

  it('is a class', () => {
    expect(() => Vector()).to.throw('cannot be invoked without \'new\'')
  })

})
