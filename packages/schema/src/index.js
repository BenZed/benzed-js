import Schema from './schema'

import {
  required
} from './validators'

import {
  type, bool, string, number, object, func, array,
  arrayOf, typeOf, oneOfType
} from './types'

import {
  OPTIONAL_CONFIG
} from './util'

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema

export {

  Schema,

  required,

  type, bool, string, number, object, func, array,
  arrayOf, typeOf, oneOfType,

  OPTIONAL_CONFIG

}
