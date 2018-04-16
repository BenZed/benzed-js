import { assert } from 'chai'
import lerp from './lerp'
import Test from '@benzed/test'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

Test.optionallyBindableMethod(lerp, lerp => {

  it('lerps a value from $from $to to by $delta: \tlerp(5,10,0.5) === 7.5', () => {
    assert.equal(lerp(5, 10, 0.5), 7.5)
  })

  it('works from hi to low: \t\t\t\tlerp(6,2,0.25) === 5', () => {
    assert.equal(lerp(6, 2, 0.25), 5)
  })

  it('works on negative values: \t\t\tlerp(0, -10, 0.1) === -1', () => {
    assert.equal(lerp(0, -10, 0.1), -1)
  })

  it('$delta is unclamped: \t\t\t\tlerp(-10, 10, 1.5) === 20', () => {
    assert.equal(lerp(-10, 10, 1.5), 20)
  })

  it('$delta is unclamped: \t\t\t\tlerp(-10, 10, 1.5) === 20', () => {
    assert.equal(lerp(-10, 10, 1.5), 20)
  })

})
