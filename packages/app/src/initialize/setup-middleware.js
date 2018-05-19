import { serverSideRendering } from '../middleware'

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
    app.configure(app.rest)

  const publicDir = configRest && configRest.public
  if (publicDir)
    feathers
      .use('/static/', express.static(configRest.public))
      .use(serverSideRendering(configRest.public, app.RoutesComponent))

  feathers
    .use(express.errorHandler())

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupMiddleware
