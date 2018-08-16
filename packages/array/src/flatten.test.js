import { expect } from 'chai'

import flatten from './flatten'
import Test from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(flatten, flatten => {

  it('flattens arrays', () => {
    expect(flatten([ 1, [2], [3, [4]] ]))
      .to.deep.equal([1, 2, 3, 4])
  })

})
