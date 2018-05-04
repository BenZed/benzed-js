import { OPTIONAL_CONFIG } from '../util'
import typeOf, { specificTypeConfig } from './type-of'
import is from 'is-explicit'

/******************************************************************************/
// Default Cast
/******************************************************************************/

const toBoolean = value => {

  if (is(value, String))
    return /^true$/i.test(value)
      ? true
      : /^false$/i.test(value)
        ? false
        : value

  if (is(value, Number))
    return value === 1
      ? true
      : value === 0
        ? false
        : value

  if (is(value, Object) && is(value.valueOf, Function))
    value = value.valueOf()

  return value
}

/******************************************************************************/
// Main
/******************************************************************************/

function bool (...args) {
  const config = specificTypeConfig(args)

  config.type = Boolean
  config.cast = config.cast || toBoolean

  return typeOf(config)
}

bool[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default bool