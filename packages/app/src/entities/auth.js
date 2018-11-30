import authentication from '@feathersjs/authentication'
import local from '@feathersjs/authentication-local'
import jwt from '@feathersjs/authentication-jwt'
import { randomBytes } from 'crypto'

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

  const { children, ...options } = props

  return app => {

    if (!app.rest)
      throw new Error('authentication cannot be configured without rest')

    app.set('auth', validateOptions(options))

    app.configure(authentication(options))
      .configure(local())
      .configure(jwt())

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default auth
