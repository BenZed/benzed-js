import { OPTIONAL_CONFIG, TYPE } from '../util'
import { anyTypeConfig } from './type-of'
import validate from '../validate'

/******************************************************************************/
// Main
/******************************************************************************/

function any (...args) {

  const { validators } = anyTypeConfig(args)
  const any = (value, context) => {

    const result = validators && validators.length > 0
      ? validate(validators, value, context)
      : value

    return result
  }

  any[TYPE] = 'Any'

  return any

}

any[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default any
