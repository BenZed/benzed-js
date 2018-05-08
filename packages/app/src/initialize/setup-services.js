import is from 'is-explicit'

// import { UserService } from '../services'

/******************************************************************************/
// Main
/******************************************************************************/

function setupServices () {

  const app = this
  const { feathers } = app

  const authConfig = feathers.get('auth')

  // If it's a function, call the function
  if (is(app.services, Function))
    app.services(feathers)

  // Otherwise, if it's defined, it will be an object of functions (thanks to validation)
  else if (app.services)
    for (const service of app.services)
      app::service(feathers)

  // set up users if it hasn't been setup already
  // TODO use the UserService wrapper
  if (authConfig && !feathers.service(authConfig.service))
    feathers.use('/' + authConfig.service, require('feathers-memory')())

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupServices
