import { expect } from 'chai'
import oneOf from './one-of'
import { required, cast } from '../validators'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('oneOf', () => {

  let set, oneOfSet
  before(() => {
    set = [ 1, 2, 'three', false ]
    oneOfSet = oneOf(set)
  })

  it('validates if an value is one of several values', () => {
    expect(oneOfSet(1)).to.be.equal(1)
  })

  it('returns error if given value is not in set', () => {
    expect(oneOfSet(3)).to.have.property('message', `Must be one of: ${set.join(', ')}`)
  })

  describe('takes config', () => {
    it('values array', () => {
      const oneOfChar = oneOf({
        values: ['a', 'b', 'c']
      })

      expect(oneOfChar('a')).to.be.equal('a')
      expect(oneOfChar('b')).to.be.equal('b')
      expect(oneOfChar('c')).to.be.equal('c')
      expect(oneOfChar('d')).to.have.property('message', `Must be one of: a, b, c`)
    })
    it('err message', () => {
      const oneOfCode = oneOf({
        values: [400, 401, 402],
        err: 'Must be between 400 and 402'
      })
      expect(oneOfCode(403)).to.have.property('message', 'Must be between 400 and 402')
    })

    it('cast function', () => {
      const oneOrTwo = oneOf(cast(parseInt), [1, 2])

      expect(oneOrTwo('1')).to.be.equal(1)
      expect(oneOrTwo('3')).to.have.property('message', 'Must be one of: 1, 2')
    })

    it('validators array', () => {
      const fooOrBarRequired = oneOf(['foo', 'bar'], required)

      expect(fooOrBarRequired(null)).to.have.property('message', 'is Required.')
    })
  })
})
