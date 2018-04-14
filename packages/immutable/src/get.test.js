import { expect } from 'chai'
import { get } from '../src'

import Test from '@benzed/test'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(get, getter => {

  it('gets values in objects via a path', () => {

    const obj = { key: 'value' }

    expect(getter(obj, 'key'))
      .to
      .equal('value')
  })

  it('returns copies of gotten values', () => {

    const obj = {
      nested: {
        foo: 'bar'
      }
    }

    const nested = getter(obj, 'nested')
    expect(nested).to.deep.equal(obj.nested)
    expect(nested).to.not.equal(obj.nested)

  })

})

Test.optionallyBindableMethod(get.mut, getMutable => {

  it('is the mutable version', () => {

    const obj = {
      nested: {
        foo: 'bar'
      }
    }

    const nested = getMutable(obj, 'nested')
    expect(nested).to.deep.equal(obj.nested)
    expect(nested).to.equal(obj.nested)

  })

}, 'get.mut')
