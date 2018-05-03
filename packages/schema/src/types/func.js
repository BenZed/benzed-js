import { OPTIONAL_CONFIG } from '../util'
import typeOf, { specificTypeConfig } from './type-of'

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
