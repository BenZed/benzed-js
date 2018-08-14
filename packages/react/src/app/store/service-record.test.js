import { expect } from 'chai'

import ServiceRecord from './service-record'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

class FakeStore {}

describe('ServiceRecord', () => {

  it('is a class', () => {
    expect(ServiceRecord).to.throw('invoked without \'new')
  })

  describe('construction', () => {

    it('must be instantiated with an id', () => {
      expect(() => new ServiceRecord()).to.throw(
        `must be instantiated with an id`
      )
    })

    it('must be instantiated with a store', () => {
      expect(() => new ServiceRecord(0)).to.throw(
        `must be instantiated with a store`
      )
    })

    it('sets id and _id property', () => {
      const record = new ServiceRecord(0, new FakeStore())
      expect(record.id).to.be.equal(0)
      expect(record._id).to.be.equal(0)
    })
  })
})
