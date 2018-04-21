import { assert } from 'chai'
import clamp from './clamp'
import Test from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(clamp, clamp => {

  it('clamps $num between $min and $max: \t\tclamp(5,2,4) === 4', () => {
    assert.equal(clamp(5, 2, 4), 4)
  })

  it('clamps between 0 and 1 by default: \t\tclamp(-1) === 0', () => {
    assert.equal(clamp(-1), 0)
  })

  it('bound values transfer defaults properly: \tclamp(2) === 1', () => {
    assert.equal(clamp(2), 1)
  })

})
