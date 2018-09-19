import { prepareGeneric } from '../../../hooks/hook'
import { AUTH_PRIORITY } from '../../../hooks/jwt-auth'

/******************************************************************************/
// Data
/******************************************************************************/

// this is kept as a dangling reference, so that if hashPassword is never used,
// I never have to import the authentication-local dependencies
let _hashPasswordInstance

/******************************************************************************/
// Main
/******************************************************************************/

function hashPassword () {

  if (!_hashPasswordInstance)
    _hashPasswordInstance = require('@feathersjs/authentication-local')
      .hooks
      .hashPassword()
      ::prepareGeneric('password::hash', AUTH_PRIORITY + 100)

  return _hashPasswordInstance
}
/******************************************************************************/
// Exports
/******************************************************************************/

export default hashPassword
