import { expect } from 'chai'
import func from './func'
import { cast } from '../validators'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('func()', () => {
  let isFunc
  before(() => {
    isFunc = func()
  })

  it('returns an error if an input is not a function', () => {
    expect(isFunc(true)).to.have.property('message', 'Must be of type: Function')
  })

  it('returns value otherwise', () => {
    const yup = () => true
    expect(isFunc(yup)).to.be.equal(yup)
  })

  it('null and undefined are ignored', () => {
    expect(isFunc(undefined)).to.be.equal(undefined)
    expect(isFunc(null)).to.be.equal(null)
  })

  describe('it takes a config', () => {
    it('err string', () => {
      expect(func('Functions Only')(1000)).to.have.property('message', 'Functions Only')
    })
    it('cast function', () => {
      const castAllToFunc = func(cast(value => () => value))
      expect(castAllToFunc(true)).to.be.instanceof(Function)
      expect(castAllToFunc('yay')()).to.be.equal('yay')
    })
  })

})
