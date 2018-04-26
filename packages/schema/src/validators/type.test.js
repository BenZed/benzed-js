import { expect } from 'chai'

import type from './type'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('type()', () => {

  it('throws if value can not be casted to type', () => {

    const number = type(Number)

    expect(() => number('foo')).to.throw()
    expect(() => number('123')).to.not.throw()
    expect(() => number(new Date())).to.not.throw()
    expect(() => number(10000)).to.not.throw()

  })

})
