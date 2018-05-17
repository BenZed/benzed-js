import { OPTIONAL_CONFIG } from '../util/symbols'
import { specificTypeConfig } from '../util/type-config'

import typeOf from './type-of'

import is from 'is-explicit'

/******************************************************************************/
// Default Cast
/******************************************************************************/

const isBoolOrNum = [Boolean, Number]::is

const toString = value => {

  if (is.object(value) &&
      is.func(value.toString) &&
      value.toString !== Object.prototype.toString)

    return value.toString()

  if (isBoolOrNum(value))
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
