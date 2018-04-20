import is from 'is-explicit'

// import { UserService } from '../services'

/******************************************************************************/
// Main
/******************************************************************************/

function setupServices () {

  const app = this
  const { feathers } = app

  const auth = feathers.get('auth')

  // If it's a function, call the function
  if (is(app.services, Function))
    app.services(feathers)

  // Otherwise, if it's defined, it will be an object of functions (thanks to validation)
  else if (app.services) for (const key in app.services)
    app::app.services[key](feathers)

  if (auth && !feathers.service(auth.service))
    feathers.use('/' + auth.service, require('feathers-memory')())

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupServices
