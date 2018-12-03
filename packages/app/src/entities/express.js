import { merge } from '@benzed/immutable'

/******************************************************************************/
// Main
/******************************************************************************/

const _express = props => {

  const { children, ...options } = props

  return app => {

    const express = require('@feathersjs/express')
    const cors = require('cors')
    const compress = require('compression')

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

    return app
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default _express
