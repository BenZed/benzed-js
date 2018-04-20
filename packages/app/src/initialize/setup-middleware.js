
/******************************************************************************/
// Main
/******************************************************************************/

function setupMiddleware () {

  const app = this

  const { feathers } = app

  if (!app.rest)
    return

  const express = require('@feathersjs/express')

  // if app.rest is a function, it's expected to be middleware
  if (typeof app.rest === 'function')
    app.rest(feathers)

  const ui = feathers.get('ui')
  if (ui && ui.public)
    feathers
      .use('/', express.static(ui.public))

  feathers
    .use(express.errorHandler())

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupMiddleware
