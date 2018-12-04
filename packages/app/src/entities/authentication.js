import { randomBytes } from 'crypto'

import { applyHooks, applyMutators } from './service'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

const validateOptions = <object key='auth'>
  <string key='secret' default={() => randomBytes(48).toString('hex')} />
  <string key='path' default='/authentication' />
  <string key='entity' default='user' />
  <string key='service' default='users' />
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const auth = props => {

  const { children: mutators, ...options } = props

  return app => {

    if (!app.rest)
      throw new Error('authentication cannot be configured without rest')

    app.set('authentication', validateOptions(options))

    const authentication = require('@feathersjs/authentication')
    const local = require('@feathersjs/authentication-local')
    const jwt = require('@feathersjs/authentication-jwt')

    app.configure(authentication(options))
      .configure(jwt())
      .configure(local())

    const { authenticate } = authentication.hooks

    const service = app.service(options.path)

    service.hooks({
      before: {
        create: [
          authenticate([ 'local', 'jwt' ])
        ],
        remove: [
          authenticate('jwt')
        ]
      }
    })

    return applyMutators([ ...mutators || [], applyHooks ], service)

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default auth
