import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { hooks as localHooks } from '@feathersjs/authentication-local'
import hookGeneric from './hook'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const { protect } = localHooks

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

  return hookGeneric({
    ...options,
    func: options => protect(options.passwordField)
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default hookAuth
