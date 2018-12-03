import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import hookGeneric from './hook'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validation
/******************************************************************************/

const validateOptions = <object key='remove-password' plain>
  <string key='passwordField' default='password' />
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const hookAuth = props => {

  const { children, ...rest } = props

  const options = validateOptions(rest)

  const { hooks } = require('@feathersjs/authentication-local')

  return hookGeneric({
    ...options,
    func: options =>
      hooks.protect(options.passwordField)
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default hookAuth
