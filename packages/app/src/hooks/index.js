import Hook, { prepareGeneric, PRIORITY } from './hook'

import jwtAuth from './jwt-auth'
import hashPassword from './hash-password'
import validatePassword from './validate-password'
import softDelete from './soft-delete'

/******************************************************************************/
// Exports
/******************************************************************************/

export {

  jwtAuth,
  softDelete,

  hashPassword,
  validatePassword,

  Hook, prepareGeneric, PRIORITY
}
