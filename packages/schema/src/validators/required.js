import { ZERO_CONFIG } from '../util'
import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function required (msg = 'is required.') {

  return value => is(value)
    ? value
    : new Error(msg)

}

required[ZERO_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default required
