import { OPTIONAL_CONFIG } from '../util/symbols'
import { specificTypeConfig } from '../util/type-config'

import typeOf from './type-of'

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
