import { expect } from 'chai'

import argsToConfig from './args-to-config'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const EXAMPLE_LAYOUT = [{

}]

describe.only('argsToConfig', () => {

  it('is a function', () => {
    expect(argsToConfig).to.be.instanceof(Function)
  })

  it('returns a functinon', () => {
    expect(argsToConfig(EXAMPLE_LAYOUT)).to.be.instanceof(Function)
  })

  it('optionally expects an array of plain objects', () => {

  })

})
