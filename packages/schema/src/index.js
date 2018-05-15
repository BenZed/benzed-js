import Schema from './schema'
import PropTypeSchema from './prop-type-schema'

import {
  required,
  format,
  length,
  defaultTo

} from './validators'

import {
  type, bool, string, number, object, func, array,
  arrayOf, typeOf, oneOf, oneOfType, any
} from './types'

import {
  OPTIONAL_CONFIG
} from './util'

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema

export {

  Schema, PropTypeSchema,

  required, format, length, defaultTo,

  type, bool, string, number, object, func, array,
  arrayOf, typeOf, oneOf, oneOfType, any, any as group,

  OPTIONAL_CONFIG

}
