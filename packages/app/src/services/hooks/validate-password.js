import is from 'is-explicit'

import { Schema, string, length, trim } from '@benzed/schema'
import { wrap, unwrap } from '@benzed/array'

import { checkContext } from 'feathers-hooks-common'
import { BadRequest } from '@feathersjs/errors'

import isBulkRequest from './is-bulk-request'

/******************************************************************************/
// Data
/******************************************************************************/

export const DEFAULT_LENGTH = 8

/******************************************************************************/
// Main
/******************************************************************************/

function validatePassword (minLength) {

  if (!is(minLength, Number))
    minLength = 8

  if (minLength < 0)
    throw new Error('services.user.passwordLength must be equal or above 0')

  const passProp = Schema(
    string(
      length('>=', minLength),
      trim
    )
  )

  return async function (hook) {

    checkContext(hook, 'before', ['update', 'patch', 'create'], 'password::validate')

    const isBulk = isBulkRequest(hook)
    const asBulk = wrap(hook.data)

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

      const error = await passProp.validate(password)
      if (error)
        throw new BadRequest('Password invalid.', { errors: {
          password: error
        }})
    }

    hook.data = isBulk
      ? asBulk
      : unwrap(asBulk)

    return hook

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default validatePassword
