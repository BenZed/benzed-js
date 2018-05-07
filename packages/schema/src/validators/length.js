import is from 'is-explicit'
import { hasNumericLength } from '@benzed/array'

/******************************************************************************/
// Helper
/******************************************************************************/

// TODO this should be moved to util so it can be used for multiple validators

const COMPARERS = {

  '>' (value, err) {
    const min = this
    return value > min
      ? value
      : new Error(err || `must be greather than ${min}.`)
  },

  '>=' (value, err) {
    const min = this
    return value >= min
      ? value
      : new Error(err || `must be equal to or greater than ${min}.`)
  },

  '<=>' (value, err) {
    const [ min, max ] = this
    return value >= min && value <= max
      ? value
      : new Error(err || `must between ${min} and ${max}.`)
  },

  '<=' (value, err) {
    const min = this
    return value <= min
      ? value
      : new Error(err || `must be equal to or less than ${min}.`)
  },

  '<' (value, err) {
    const min = this
    return value < min
      ? value
      : new Error(err || `must be less than ${min}.`)
  }

}

function createComparer (operator, value) {

  if (is(operator, Number)) {
    const min = operator
    const max = value
    return [min, max]::COMPARERS['<=>']
  }

  if (operator in COMPARERS === false)
    throw new Error(`${operator} is not a valid comparer.`)

  return value::COMPARERS[operator]
}

/******************************************************************************/
// Main
/******************************************************************************/

// validates the length of a numeric length value
// TODO this should be using a argsToConfig function
function length (operator, value, err) {

  const compare = createComparer(operator, value)

  return value => {

    if (value == null || !hasNumericLength(value))
      return value

    const result = compare(value, err)
    if (result instanceof Error)
      result.message = 'length ' + result.message

    return result

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default length
