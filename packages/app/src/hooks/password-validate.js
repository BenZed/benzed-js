import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { first, wrap } from '@benzed/array'

import { BadRequest } from '@feathersjs/errors'

import declareEntity from '../declare-entity'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Helper
/******************************************************************************/

function PasswordInvalidError (msg) {
  return new BadRequest('Password invalid.', {
    errors: {
      password: msg
    }
  })
}

function PasswordMismatchError () {
  return new BadRequest('Password mismatch.', {
    errors: {
      password: 'Must match confirm field.',
      passwordConfirm: 'Must match password field.'
    }
  })
}

/******************************************************************************/
// Helper
/******************************************************************************/

const validate = <object key='password' plain required >
  <number key='length'
    range={['>', 3]}
    default={8}
  />
  <bool key='uppercase' />
  <bool key='symbol' />
  <bool key='number' />
  <func key='custom' />
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const passwordValidate = props => {

  const { length, symbol, uppercase, number } = validate(props)

  return declareEntity('hook', {
    name: 'password-validate',
    types: 'before',
    methods: [ 'create', 'patch', 'update' ]

  }, ctx => {

    const asMulti = wrap(ctx.data)

    for (const data of asMulti) {

      const { password, passwordConfirm, custom } = data

      // Remove from data, as it's not going to be needed anymore and shouldn't
      // end up in the saved documents
      delete data.passwordConfirm

      // only matters if a password was supplied
      if (!password && !passwordConfirm) {

        // we're deleting the password from the hook, because the hashpassword hook
        // can't handle null values
        delete data.password
        continue
      }

      if (password.length < length)
        throw new PasswordInvalidError(`Must be at least ${length} characters.`)

      if (uppercase && !/[A-Z]/.test(password))
        throw new PasswordInvalidError(`Must have at least one uppercase character.`)

      if (symbol && !/!|@|#|\$|%|&|\^|\*/.test(password))
        throw new PasswordInvalidError(`Must have at least one symbol character.`)

      if (number && !/\d/.test(password))
        throw new PasswordInvalidError(`Must have at least one numeric character.`)

      if (custom) try {
        custom(password)
      } catch (e) {
        throw new PasswordInvalidError(e.message)
      }

      if (password !== passwordConfirm)
        throw new PasswordMismatchError()

    }

    ctx.data = ctx.isCreate && ctx.isMulti
      ? asMulti
      : first(asMulti)

    return ctx

  })
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default passwordValidate
