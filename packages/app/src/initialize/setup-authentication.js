
/******************************************************************************/
// Main
/******************************************************************************/

function setupAuthentication () {

  const app = this

  const { feathers } = app

  const auth = app.get('auth')
  if (!auth)
    return

  if (auth && !app.rest)
    throw new Error('Authentication cannot be configured on this app. Rest provider is not enabled.')

  const authentication = require('@feathersjs/authentication')
  const local = require('@feathersjs/authentication-local')
  const jwt = require('@feathersjs/authentication-jwt')

  // Configure strategies
  feathers.configure(authentication(auth))
    .configure(local())
    .configure(jwt())

  // Add Strategy Hooks
  const authService = feathers.service(auth.path)
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
