import { merge } from '@benzed/immutable'
import express from '@feathersjs/express'
import compress from 'compression'
import cors from 'cors'

/******************************************************************************/
// Main
/******************************************************************************/

const _express = props => {

  const { children, ...options } = props

  return app => {

    app.set('express', options)

    const settings = { ...app.settings }
    app = express(app)
      .configure(express.rest())
      .options('*', cors())
      .use(cors())
      .use(compress())
      .use(express.json())
      .use(express.urlencoded({ extended: true }))

    // Move settings to deferred feathers object
    app.settings = merge(app.settings, settings)

    // Ensure error handling comes last
    app.once('start',
      () => app.once('listen',
        () => app.use(express.errorHandler())
      )
    )

    return app
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default _express
