import { expect } from 'chai'
import addDependencies from './add-dependencies'
import is from 'is-explicit'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('addDependencies', () => {

  it('is a function', () => {
    expect(is.func(addDependencies)).to.be.equal(true)
  })

  it('must be bound to context', () => {
    expect(addDependencies).to.throw('Cannot destructure property `dependencies` of \'undefined\' or \'null\'.')
  })

  it('adds a dependencies to package.json')

})
