
/******************************************************************************/
// Main
/******************************************************************************/

function setupAuthentication () {

  const app = this

  const { feathers } = app

  const configAuth = app.get('auth')
  if (!configAuth)
    return

  const configRest = app.get('rest')
  if (configAuth && !configRest)
    throw new Error('Authentication cannot be configured on this app. Rest provider is not enabled.')

  const authentication = require('@feathersjs/authentication')
  const local = require('@feathersjs/authentication-local')
  const jwt = require('@feathersjs/authentication-jwt')

  // Configure strategies
  feathers.configure(authentication(configAuth))
    .configure(local())
    .configure(jwt())

  // Add Strategy Hooks
  const authService = feathers.service(configAuth.path)
  const { authenticate } = authentication.hooks
  authService.hooks({
    before: {
      create: authenticate([ 'jwt', 'local' ]),
      remove: authenticate('jwt')
    }
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupAuthentication
