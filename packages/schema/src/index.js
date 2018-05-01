import Schema from './schema'

import { SELF } from './util'

import * as validators from './validators'

/******************************************************************************/
// Extend
/******************************************************************************/

for (const key in validators)
  Schema[key] = validators[key]

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema

export {

  Schema,

  validators,

  SELF,
  SELF as $

}
