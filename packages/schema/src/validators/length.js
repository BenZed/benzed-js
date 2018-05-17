import { hasNumericLength } from '@benzed/array'
import rangeConfig from '../util/range-config'

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

  return value =>

    value == null || !hasNumericLength(value)
      ? value
      : config.compare(value.length, err)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default length
