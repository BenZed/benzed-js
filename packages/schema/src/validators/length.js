import { hasNumericLength } from '@benzed/array'
import rangeConfig from '../util/range-config'
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

  const config = rangeConfig(args)

  const err = config.err || defaultLengthError

  return value => {

    if (value == null || !hasNumericLength(value))
      return value

    const result = config.compare(value.length, err)
    if (is(result, Error))
      return result

    return value
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default length
