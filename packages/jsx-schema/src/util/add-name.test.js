import { expect } from 'chai'

import addName from './add-name'
import { Test } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(addName, addName => {

  it('adds names to objects', () => {

    const obj = {}
    addName(obj, 'jerry')

    expect(obj).to.have.property('name', 'jerry')
  })

  it('throws if not object or function', () => {
    expect(() => addName('string', 'koopa')).to.throw('must be an object or function')
  })

})
