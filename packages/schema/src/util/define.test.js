import { expect } from 'chai'

import define from './define'
import { Test } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(define, define => {

  it('defines properties on objects', () => {

    const obj = {}
    define(obj, { name: 'jerry', priority: 0 })

    expect(obj).to.have.property('name', 'jerry')
    expect(obj).to.have.property('priority', 0)
  })

  it('throws if not object or function', () => {
    expect(() => define('string', 'koopa')).to.throw('must be an object or function')
  })

})
