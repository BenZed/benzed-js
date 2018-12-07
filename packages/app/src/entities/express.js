
/* eslint-disable no-unused-vars */
import Schema from '@benzed/schema'
import { MustBeEmpty } from './validation'
/* eslint-enable unused-vars */

import { merge, copy } from '@benzed/immutable'
import { wrap } from '@benzed/array'

import is from 'is-explicit'

import { isApp } from '../util'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Helper
/******************************************************************************/

const deregister = app => {

  const settings = copy(app.settings)
  const events = copy(app._events)

  for (const key in app._events || {})
    app.removeAllListeners(key)

  return { settings, events }

}

const register = (app, { settings, events }) => {

  app.settings = merge(app.settings, settings)

  // a simple merge will overwrite handlers registered
  // by the express entity or any of it's children. (right now
  // there arn't any, but why
  if (events) for (const type in events) {
    const handlers = wrap(events[type])
      .filter(is.defined)

    for (const handler of handlers)
      app.on(type, handler)
  }

}

/******************************************************************************/
// Validation
/******************************************************************************/

const validate = <object key='express'>
  <MustBeEmpty key='children'/>
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const express = props => {

  validate(props)

  return app => {

    if (!app::isApp())
      throw new Error(`<express/> must be parented to an <app/> entity`)

    const expressify = require('@feathersjs/express')
    const cors = require('cors')
    const compress = require('compression')

    const old = deregister(app)

    app = expressify(app)
      .configure(expressify.rest())
      .options('*', cors())
      .use(cors())
      .use(compress())
      .use(expressify.json())
      .use(expressify.urlencoded({ extended: true }))

    // Move settings to deferred feathers object
    register(app, old)

    return app
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default express
