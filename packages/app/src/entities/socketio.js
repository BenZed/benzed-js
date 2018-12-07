
/* eslint-disable no-unused-vars */
import { MustBeEmpty } from './validation'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
/* eslint-enable no-unused-vars */

import { isApp } from '../util'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */
/******************************************************************************/
// Terminate Collection
/******************************************************************************/

const terminateSocketIo = app => {

  if (app.io)
    return new Promise(resolve => app.io.close(resolve))

}

/******************************************************************************/
// Validate
/******************************************************************************/

const validate = <object key='socketio'>
  <MustBeEmpty key='children' />
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const socketio = props => {

  const { children, ...options } = validate(props)

  return app => {

    if (!app::isApp())
      throw new Error(`<socketio/> must be parented to an <app/> entity`)

    const socketioify = require('@feathersjs/socketio')

    app.configure(
      socketioify(options/*, socketMiddleware */)
    )

    app.on('end', terminateSocketIo)
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default socketio
