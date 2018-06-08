import { expect } from 'chai'
import isMobile from './is-mobile'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('isMobile', () => {

  it('is a boolean', () => {
    expect(typeof isMobile).to.be.equal('boolean')
  })

  it('no point in testing this one, bud. Just trust it.', () => {
    return 'ok cool'
  })
})
