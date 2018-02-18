import { expect } from 'chai'
import { get } from '../src'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('get()', () => {

  it('gets values in objects via a path', () => {

    const obj = { key: 'value' }

    expect(obj::get('key'))
      .to
      .equal('value')
  })

})
