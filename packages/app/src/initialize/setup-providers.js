import is from 'is-explicit'
import { merge } from '@benzed/immutable'

import { isEnabled } from '../configure'

/******************************************************************************/
// Main
/******************************************************************************/

function setupProviders () {

  const app = this
  let { feathers } = app

  const configRest = app.get('rest')
  if (isEnabled(configRest)) {
    const express = require('@feathersjs/express')
    const compress = require('compression')
    const cors = require('cors')

    const { settings } = feathers

    feathers = app.feathers = express(feathers)
    feathers
      .configure(express.rest())
      .options('*', cors())
      .use(cors())
      .use(compress())

      .use(express.json())
      .use(express.urlencoded({ extended: true }))

    // Move settings to deferred feathers object
    feathers.settings = merge(feathers.settings, settings)
  }

  const configIo = app.get('socketio')
  if (isEnabled(configIo)) {
    const socketio = require('@feathersjs/socketio')
    const middleware = is(app.socketio, Function)
      ? ::app.socketio
      : null

    const options = {
      // wsEngine: 'uws',
      ...configIo
    }

    feathers.configure(socketio(options, middleware))
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupProviders
