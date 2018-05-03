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

    it('returns a new context with a appended path', () => {

      const context = new Context(data, args, path)

      const context2 = context.push('key')

      expect(context2).to.not.equal(context)
      expect(context2.path).to.deep.equal([ ...path, 'key' ])
      expect(context.path).to.deep.equal(path)

    })

  })

})
