import is from 'is-explicit'

/******************************************************************************/
// Data
/******************************************************************************/

const METHODS = [
  'get', 'set', 'configure', 'use', 'service'
]

/******************************************************************************/
// Main
/******************************************************************************/

function isApp (app) {
  if (this !== undefined)
    app = this

  // TODO is.object doesn't seem to work on heroku, so we're doing this for now
  const type = typeof app

  return app !== null &&
    (type === 'object' || type === 'function') &&
    METHODS.every(method => is.func(app[method]))

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default isApp
