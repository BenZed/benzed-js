import { expect } from 'chai'
import isEvent from './is-event'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('isEvent', () => {

  it('is a function', () => {
    expect(isEvent).to.be.instanceof(Function)
  })

  it('returns true if input is an object with a \'target\' property', () => {
    expect(isEvent({ target: null })).to.be.equal(true)
    expect(isEvent({ })).to.be.equal(false)
    expect(isEvent(null)).to.be.equal(false)
    expect(isEvent('target')).to.be.equal(false)
  })

  it('should probably be renamed \'isEventLike\'', () => {
    return 'yeah'
  })

})
