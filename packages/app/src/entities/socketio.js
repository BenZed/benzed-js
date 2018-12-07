
/* eslint-disable no-unused-vars */
import { MustBeEmpty } from './validation'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
/* eslint-enable no-unused-vars */

import { isApp } from '../util'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */
/******************************************************************************/
// Event Handlers
/******************************************************************************/

const terminateSocketIo = app => {

  if (app.io)
    return new Promise(resolve => app.io.close(resolve))

}

/******************************************************************************/
// Helpers
/******************************************************************************/

function combine (io) {

  const [ app, middleware ] = this

  if (middleware) for (const func of middleware)
    func(io, app)
}

/******************************************************************************/
// Validate
/******************************************************************************/

const validate = <object key='socketio'>
  <array key='children' default={[]}>
    <func required />
  </array>
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

    const middleware = [ app, children ]::combine

    app.configure(
      socketioify(options, middleware)
    )

    app.on('end', terminateSocketIo)
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default socketio
