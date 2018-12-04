import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import hookGeneric from './hook'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

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

const passwordHash = props => {

  const { children, ...rest } = props

  const { hooks } = require('@feathersjs/authentication-local')

  const options = validateOptions(rest)

  return hookGeneric({
    ...options,
    func: hooks.hashPassword
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default passwordHash
