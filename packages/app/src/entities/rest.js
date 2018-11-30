import { merge } from '@benzed/immutable'
import express from '@feathersjs/express'
import compress from 'compression'
import cors from 'cors'

/******************************************************************************/
// Main
/******************************************************************************/

const rest = props => {

  const { children, ...options } = props

  return app => {

    app.set('rest', options)

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

    return app
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default rest
