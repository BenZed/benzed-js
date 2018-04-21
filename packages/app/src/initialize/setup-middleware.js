
/******************************************************************************/
// Main
/******************************************************************************/

function setupMiddleware () {

  const app = this

  const { feathers } = app

  const configRest = app.get('rest')
  if (!configRest)
    return

  const express = require('@feathersjs/express')

  // if app.rest is a function, it's expected to be middleware
  if (typeof app.rest === 'function')
    app.configure(feathers)

  if (configRest && configRest.public)
    feathers
      .use('/', express.static(configRest.public))

  feathers
    .use(express.errorHandler())

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupMiddleware
