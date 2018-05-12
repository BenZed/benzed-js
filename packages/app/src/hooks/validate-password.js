import is from 'is-explicit'

import { Schema, string, length, trim } from '@benzed/schema'
import { wrap, unwrap } from '@benzed/array'

import { BadRequest } from '@feathersjs/errors'

import Hook from './hook'

import { AUTH_PRIORITY } from './jwt-auth'

/******************************************************************************/
// Data
/******************************************************************************/

export const DEFAULT_LENGTH = 8

/******************************************************************************/
// Setup
/******************************************************************************/

function validateLength (_length = DEFAULT_LENGTH) {
  return new Schema(
    string(
      length('>=', _length),
      trim
    )
  )
}

/******************************************************************************/
// Exec
/******************************************************************************/

async function validatePassword (ctx) {

  const { isBulk } = this.checkContext(ctx)

  const asBulk = wrap(ctx.data)

  for (const data of asBulk) {
    const { password, passwordConfirm } = data

    // Remove from data, as it's not going to be needed anymore and shouldn't
    // end up in the saved documents
    delete data.passwordConfirm

    // only matters if a password was supplied
    if (!is(password, String)) {

      // we're deleting the password from the hook, because the hashpassword hook
      // can't handle null values
      delete data.password
      continue
    }

    if (password !== passwordConfirm)
      throw new BadRequest('Password mismatch.', { errors: {
        password: 'Must match confirm field.',
        passwordConfirm: 'Must match password field.'
      }})

    const validateLength = this.options

    const error = await validateLength(password)
    if (error)
      throw new BadRequest('Password invalid.', { errors: {
        password: error
      }})
  }

  ctx.data = isBulk
    ? asBulk
    : unwrap(asBulk)

  return ctx

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default new Hook({
  name: 'password::validate',
  types: 'before',
  methods: ['update', 'patch', 'create'],
  priority: AUTH_PRIORITY + 100,

  setup: validateLength,
  exec: validatePassword
})
