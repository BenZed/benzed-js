import { serverSideRendering } from '../middleware'
import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function setupMiddleware () {

  const app = this

  const { feathers } = app

  const restConfig = app.get('rest')
  if (!restConfig)
    return

  const express = require('@feathersjs/express')

  const hasPublic = !!restConfig.public
  const hasSSR = hasPublic && (app.getClientComponent || app.onSerializeClient)

  if (hasPublic) {
    // If there is a react component to serve ssr with, we don't want to statically
    // serve the index.html, because ssr will serve one embedded with react generated
    // markup.
    const options = { index: hasSSR ? false : 'index.html' }
    feathers.use('/', express.static(restConfig.public, options))
  }

  if (is.func(app.setupRestMiddleware))
    app.setupRestMiddleware(restConfig)

  if (hasPublic && hasSSR)
    feathers
      .use(serverSideRendering({
        publicDir: restConfig.public,
        getComponent: app.getClientComponent && ::app.getClientComponent,
        serializer: app.onSerializeClient && ::app.onSerializeClient
      }))

  // ssr will also handle errors, so we only need to register middleware if there
  // is no client component
  if (!app.getClientComponent)
    feathers
      .use(express.notFound({ verbose: true }))
      .use(express.errorHandler({
        html: hasPublic,
        logger: app.log
      }))
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupMiddleware
