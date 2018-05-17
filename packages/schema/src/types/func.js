import { OPTIONAL_CONFIG } from '../util/symbols'
import { specificTypeConfig } from '../util/type-config'

import typeOf from './type-of'

/******************************************************************************/
// Main
/******************************************************************************/

function func (...args) {
  const config = specificTypeConfig(args)

  config.type = Function

  return typeOf(config)
}

func[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default func
