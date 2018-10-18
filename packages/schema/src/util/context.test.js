import { expect } from 'chai'
import Context from './context'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Context', () => {

  it('is a class', () => {
    expect(() => Context()).to.throw(`invoked without 'new'`)
  })

})
