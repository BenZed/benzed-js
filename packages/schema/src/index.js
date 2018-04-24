import Schema from './schema'

import { SKIP, SELF } from './util'

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

  SKIP,
  SELF,
  SELF as $

}
