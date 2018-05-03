import { OPTIONAL_CONFIG } from '../util'
import typeOf, { specificTypeConfig } from './type-of'
import is from 'is-explicit'

/******************************************************************************/
// Default Cast
/******************************************************************************/

const toString = value => {

  if (is(value, Object) &&
      is(value.toString, Function) &&
      value.toString !== Object.prototype.toString)

    return value.toString()

  if (is(value, Boolean, Number))
    return `${value}`

  return value

}

/******************************************************************************/
// Main
/******************************************************************************/

function string (...args) {

  const config = specificTypeConfig(args)

  config.type = String
  config.cast = config.cast || toString

  return typeOf(config)
}
string[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default string
