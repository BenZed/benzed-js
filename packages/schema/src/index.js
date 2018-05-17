import Schema from './schema'
import PropTypeSchema from './prop-type-schema'

import {
  required,
  format,
  length,
  defaultTo,

  cast

} from './validators'

import {
  type, bool, string, number, object, func, array,
  arrayOf, typeOf, oneOf, oneOfType, any
} from './types'

import { OPTIONAL_CONFIG } from './util/symbols'

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema

export {

  Schema, PropTypeSchema,

  required, format, length, defaultTo,

  cast,

  type, bool, string, number, object, func, array,
  arrayOf, typeOf, oneOf, oneOfType, any, any as group,

  OPTIONAL_CONFIG

}
