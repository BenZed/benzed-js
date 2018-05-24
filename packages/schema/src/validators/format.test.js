import { expect } from 'chai'
import format from './format'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('format()', () => {

  let alpha
  before(() => {
    alpha = format(/[a-z]/)
  })

  it('returns an error if value is a string that does not pass regexp test', () => {
    expect(alpha('100')).to.have.property('message', 'Incorrect Format.')
  })

  it('returns value if not a string', () => {
    expect(alpha(100)).to.be.equal(100)
  })

  it('returns value otherwise', () => {
    expect(alpha('ace')).to.be.equal('ace')
  })

  describe('configuration', () => {

    it('format regex', () => {
      const numeric = format(/\d/)
      expect(numeric('192')).to.be.equal('192')
      expect(numeric('ace')).to.have.property('message', 'Incorrect Format.')

      expect(() => format()).to.throw('format config requires \'regex\' property')
    })

    it('err string', () => {
      const underscored = format(/^_.+_$/, 'Must begin and end with underscores')

      expect(underscored('hey hey_')).to.have.property('message', 'Must begin and end with underscores')
      expect(underscored('_yee_')).to.be.equal('_yee_')
    })

  })

})
