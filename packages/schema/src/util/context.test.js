import { expect } from 'chai'

import Context from './Context'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Context', () => {

  it('is a class', () => {
    expect(Context).to.throw('invoked without \'new\'')
  })

  const data = {}
  const args = []
  const path = [ 'path' ]

  describe('three arguments', () => {

    const context = new Context(data, args, path)

    it('first maps to this.data', () => {

      expect(context).to.have.property('data', data)

    })

    it('second maps to this.args', () => {

      expect(context).to.have.property('args', args)

    })

    it('third maps to this.args', () => {

      expect(context).to.have.property('args')
      expect(context.path).to.be.deep.equal(path)

    })

    it('copies third argument; path', () => {
      expect(context.path).to.not.equal(path)
    })

  })

  describe('push()', () => {

    let c1, c2
    before(() => {
      c1 = new Context(data, args, path)
      c2 = c1.push('key')
    })

    it('returns a new context with a appended path', () => {
      expect(c2.path).to.deep.equal([ ...c1.path, 'key' ])
      expect(c1.path).to.deep.equal(path)
    })

    it('returns a copy', () => {
      expect(c2).to.not.equal(c1)
    })

    it('copies .throw property', () => {
      const c3 = c2.safe()
      const c4 = c3.push('oy')
      expect(c4).to.have.property('throw', c3.throw)
    })
  })

  describe('safe()', () => {
    let c1
    before(() => {
      c1 = new Context({}, [], ['okay'])
    })

    it('returns a new context with .throw disabled', () => {
      expect(c1).to.have.property('throw', true)
      expect(c1.safe()).to.have.property('throw', false)
    })

    it('returns a copy', () => {
      const c2 = c1.safe()
      expect(c2).to.not.equal(c1)
    })
  })

})
