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
  const hasSSR = (app.getClientComponent || app.onSerializeClient) && hasPublic

  if (hasPublic) {
    // If there is a react component to serve ssr with, we don't want to statically
    // serve the index.html, because ssr will serve one embedded with react generated
    // markup.
    const options = { index: hasSSR ? false : 'index.html' }
    feathers.use('/', express.static(rest.public, options))
  }

  // if app.rest is a function, it's expected to be middleware
  if (app.rest)
    app.rest(rest.public)

  if (hasPublic && hasSSR)
    feathers
      .use(serverSideRendering({
        publicDir: rest.public,
        getComponent: app.getClientComponent && ::app.getClientComponent,
        serializer: app.onSerializeClient && ::app.onSerializeClient
      }))

  // ssr will also handle errors, so we only need to register middleware if there
  // is no client componetn
  if (!app.getClientComponent)
    feathers
      .use(express.notFound({ verbose: true }))
      .use(express.errorHandler({ html: hasPublic }))
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupMiddleware
