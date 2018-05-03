import { OPTIONAL_CONFIG } from '../util'
import typeOf, { specificTypeConfig } from './type-of'

/******************************************************************************/
// Main
/******************************************************************************/

function array (...args) {
  const config = specificTypeConfig(args)

  config.type = Array
  config.cast = config.cast || Array

  return typeOf(config)
}

array[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default array
