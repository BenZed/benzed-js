import { prepareGeneric } from './hook'

/******************************************************************************/
// Data
/******************************************************************************/

// this is kept as a dangling reference, so that if jwtAuth is never used,
// I never have to import the authentication dependencies
let _jwtAuthHookInstance

/******************************************************************************/
// Main
/******************************************************************************/

const AUTH_PRIORITY = -1000

function jwtAuth () {

  if (!_jwtAuthHookInstance)
    _jwtAuthHookInstance = require('@feathersjs/authentication')
      .hooks
      .authenticate('jwt')
      ::prepareGeneric('jwt-auth', AUTH_PRIORITY)

  return _jwtAuthHookInstance
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default jwtAuth

export {
  AUTH_PRIORITY
}
