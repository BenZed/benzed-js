import { hasNumericLength } from './is-array-like'
import isIterable from './is-iterable'

/******************************************************************************/
// Helper
/******************************************************************************/

const { random: _random, floor } = Math

/******************************************************************************/
// Main
/******************************************************************************/

function random (input) {

  if (typeof this !== 'undefined')
    input = this

  let indexable = hasNumericLength(input)

  if (!indexable && isIterable(input)) {
    indexable = true
    input = [ ...input ]
  }

  if (!indexable)
    throw new Error('input must be an array-like or iterable')

  const rIndex = floor(_random() * input.length)

  return input[rIndex]

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default random
