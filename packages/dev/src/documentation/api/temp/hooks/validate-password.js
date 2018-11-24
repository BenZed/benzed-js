import QuickHook from './util/quick-hook'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { wrap } from '@benzed/array'

import { BadRequest } from '@feathersjs/errors'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// DATA
/******************************************************************************/

const NOT_APPLICABLE_METHODS = [ 'find', 'get', 'remove' ]

/******************************************************************************/
// Exports
/******************************************************************************/

export default new QuickHook({
  name: 'validate-password',
  types: 'before',

  setup: <number key='password-length'
    range={['>', 0]}
    default={8}
  />,

  exec (ctx, length) {

    if (NOT_APPLICABLE_METHODS.includes(ctx.method))
      return

    const asBulk = wrap(ctx.data)

    for (const data of asBulk) {
      const { password, passwordConfirm } = data

      // Remove from data, as it's not going to be needed anymore and shouldn't
      // end up in the saved documents
      delete data.passwordConfirm

      // only matters if a password was supplied
      if (!password) {

        // we're deleting the password from the hook, because the hashpassword hook
        // can't handle null values
        delete data.password
        continue
      }

      if (password !== passwordConfirm)
        throw new BadRequest('Password mismatch.', {
          errors: {
            password: 'Must match confirm field.',
            passwordConfirm: 'Must match password field.'
          }
        })

      if (password.length < length)
        throw new BadRequest('Password invalid.', {
          errors: {
            password: `Must be at least ${length} characters.`
          }
        })
    }

    ctx.data = ctx.isBulk
      ? asBulk
      : asBulk[0]

    return ctx

  }

})
