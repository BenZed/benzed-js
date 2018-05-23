import { expect } from 'chai'
import ValidationError from './validation-error'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('ValidationError', () => {

  it('is an error', () => {
    expect(new ValidationError()).to.be.instanceof(Error)
  })

  describe('takes path, message and isInvalidType arguments', () => {
    let ve
    before(() => {
      ve = new ValidationError('foo', 'was bad.', false)
    })

    it('path', () => {
      expect(ve).to.have.deep.property('path', ['foo'])
    })

    it('message', () => {
      expect(ve).to.have.property('message', 'foo was bad.')
    })

    it('isInvalidType', () => {
      expect(ve).to.have.property('isInvalidType', false)
    })

    it('rawMessage - error message without embedded path string', () => {
      expect(ve).to.have.property('rawMessage', 'was bad.')
    })
  })
})
