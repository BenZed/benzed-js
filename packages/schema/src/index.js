import Schema from './schema'

import {
  required,
  type, bool, string, number,
  object, func
} from './validators'

import {
  SELF, OPTIONAL_CONFIG
} from './util'

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema

export {

  Schema,

  required,

  type,
  bool,
  string,
  number,
  object,
  func,

  OPTIONAL_CONFIG,
  SELF,
  SELF as $

}
