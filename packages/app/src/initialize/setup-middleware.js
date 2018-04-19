
/******************************************************************************/
// Main
/******************************************************************************/

function setupMiddleware () {

  const app = this

  const { feathers } = app

  const auth = feathers.get('auth')

  // TODO right now rest is required if authentication is configured, be
  // on the lookout to change this once the new @feathers/authentication version is up
  if (!app.rest && !auth)
    return

  const express = require('@feathersjs/express')

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
