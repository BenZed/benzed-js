
/******************************************************************************/
// Helper
/******************************************************************************/

function setupAuthentication () {

  const app = this

  const { feathers } = app

  const auth = app.get('auth')
  if (!auth)
    return

  const authentication = require('@feathersjs/authentication')
  const local = require('@feathersjs/authentication-local')
  const jwt = require('@feathersjs/authentication-jwt')

  feathers.configure(authentication(auth))
    .configure(local())
    .configure(jwt())

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupAuthentication
