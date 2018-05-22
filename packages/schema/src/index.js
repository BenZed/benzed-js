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
import argsToConfig from './util/args-to-config'

// TODO rename everywhere
import argsToRangeCompare from './util/range-config'

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

  argsToConfig, argsToRangeCompare,

  OPTIONAL_CONFIG

}
