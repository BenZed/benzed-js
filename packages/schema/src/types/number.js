import { OPTIONAL_CONFIG } from '../util'
import typeOf, { specificTypeConfig } from './type-of'

/******************************************************************************/
// Main
/******************************************************************************/

function number (...args) {
  const config = specificTypeConfig(args)

  config.type = Number
  config.cast = config.cast || Number

  return typeOf(config)
}

number[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default number
