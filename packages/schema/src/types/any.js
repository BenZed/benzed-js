import normalizeValidator from '../util/normalize-validator'
import { OPTIONAL_CONFIG, TYPE } from '../util/symbols'
import { anyTypeConfig } from '../util/type-config'
import validate from '../util/validate'

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * any - Description
 *
 * @param {array} args Description
 *
 * @return {type} Description
 */
function any (...args) {

  const config = anyTypeConfig(args)

  const validators = config.validators.map(normalizeValidator)

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
