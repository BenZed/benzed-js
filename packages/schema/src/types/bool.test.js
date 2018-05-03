import { expect } from 'chai'
import bool from './bool'
import { OPTIONAL_CONFIG } from '../util'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('bool()', () => {

  const b = bool()

  it('returns if value could not be cast to number', () => {
    expect(
      b(100)
    ).to.have.property('message', 'Must be of type: Boolean')
  })

  it('null and undefined are ignored', () => {

    expect(b(null))
      .to
      .equal(null)

    expect(b(undefined))
      .to
      .equal(undefined)
  })

  describe('takes a config', () => {

    const err = 'That\'s not a boolean.'

    it('err string', () => {
      const boolWithErr = bool(err)
      expect(boolWithErr(NaN))
        .to.have.property('message', err)
    })

    it('cast function', () => {
      const boolWithCast = bool({ cast: value => !!value })
      expect(boolWithCast(NaN))
        .to.be.equal(false)
    })

  })

  it('is optionally configurable', () => {
    expect(bool).to.have.property(OPTIONAL_CONFIG)
  })

  describe('default casting', () => {

    it('it casts string if string is explicitly equal to true or value, case insensitive', () => {

      expect(b('true')).to.equal(true)
      expect(b('TRUE')).to.equal(true)
      expect(b('false')).to.equal(false)
      expect(b('FALSE')).to.equal(false)

    })

    it('it casts number if number is explicitly equal to 1 or 0', () => {

      expect(b(1)).to.equal(true)
      expect(b(0)).to.equal(false)

    })

    it('calls valueOf on objects', () => {

      class Bool {

        constructor (count) {
          this.count = count
        }

        valueOf () {
          return this.count > 0
        }
      }

      expect(b(new Bool(1000))).to.equal(true)
      expect(b(new Bool(-1000))).to.equal(false)

      expect(b({})).to.have.property('message', 'Must be of type: Boolean')

    })
  })
})
