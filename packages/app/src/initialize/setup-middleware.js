import { serverSideRendering } from '../middleware'

/******************************************************************************/
// Main
/******************************************************************************/

function setupMiddleware () {

  const app = this

  const { feathers } = app

  const rest = app.get('rest')
  if (!rest)
    return

  const express = require('@feathersjs/express')

  const hasPublic = !!rest.public
  const hasReactRoutes = !!app.RoutesComponent
  if (hasPublic) {
    // If there is a react component to serve ssr with, we don't want to statically
    // serve the index.html, because ssr will serve one embedded with react generated
    // markup.
    const options = { index: !hasReactRoutes }
    feathers.use('/', express.static(rest.public, options))
  }

  // if app.rest is a function, it's expected to be middleware
  if (app.rest)
    app.rest(rest.public)

  if (hasPublic && hasReactRoutes)
    feathers
      .use(serverSideRendering(rest.public, app.RoutesComponent))
  // ssr will also handle errors, so we only need to register middleware if there
  // is no RoutesComponent
  else
    feathers
      .use(express.notFound({ verbose: true }))
      .use(express.errorHandler({ html: hasPublic }))
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupMiddleware
