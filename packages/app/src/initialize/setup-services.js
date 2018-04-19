import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

function addAuthHooks (auth) {

  const app = this

  const { feathers } = app

  const authService = feathers.service(auth.path)

  const authentication = require('@feathersjs/authentication')
  const { authenticate } = authentication.hooks

  authService.hooks({
    before: {
      create: authenticate([ 'jwt', 'local' ]),
      remove: authenticate('jwt')
    }
  })

}

/******************************************************************************/
// Main
/******************************************************************************/

function setupServices () {

  const app = this

  const { feathers } = app

  const auth = feathers.get('auth')
  if (auth)
    app::addAuthHooks(auth)

  if (is(app.services, Function))
    app.services()

  else if (is.plainObject(app.services))
    for (const key in app.services)
      app.services[key]()

  if (auth && !feathers.service(auth.service))
    throw new Error(`auth is configured, but a '${auth.service}' service is not set up`)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupServices
