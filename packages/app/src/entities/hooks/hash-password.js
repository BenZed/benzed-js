import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { hooks as localHooks } from '@feathersjs/authentication-local'
import hookGeneric from './hook'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const { hashPassword } = localHooks

/******************************************************************************/
// Validation
/******************************************************************************/

const validateOptions = <object key='hash-password' plain>
  <string key='passwordField' default='password'/>
  <func key='hash' />
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const hookAuth = props => {

  const { children, ...rest } = props

  const options = validateOptions(rest)

  return hookGeneric({
    ...options,
    func: hashPassword
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default hookAuth
