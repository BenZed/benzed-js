import { hasNumericLength } from '@benzed/array'
import argsToRangeCompare from '../util/args-to-range-compare'
import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

function defaultLengthError (diff, ...values) {
  return `length must be ${diff} ${values.join(' and ')}`
}

/******************************************************************************/
// Main
/******************************************************************************/

function length (...args) {

  const compare = argsToRangeCompare([ ...args, defaultLengthError ])

  return value => {

    if (value == null || !hasNumericLength(value))
      return value

    const result = compare(value.length)
    if (is(result, Error))
      return result

    return value
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default length
