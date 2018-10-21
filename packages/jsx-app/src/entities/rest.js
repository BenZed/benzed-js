import { merge } from '@benzed/immutable'
import express from '@feathersjs/express'
import compress from 'compression'
import cors from 'cors'

/******************************************************************************/
// Main
/******************************************************************************/

const rest = props => {

  return app => {

    const settings = { ...app.settings }
    app = express(app)
      .configure(express.rest())
      .options('*', cors())
      .use(cors())
      .use(compress())
      .use(express.json())
      .use(express.urlencoded({ extended: true }))

    app.settings = merge(app.settings, settings)

    return app
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default rest
