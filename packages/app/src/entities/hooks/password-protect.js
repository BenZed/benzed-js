import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validation
/******************************************************************************/

const validateOptions = <object key='remove-password' plain strict>
  <string key='passwordField' default='password' />
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const passwordProtect = props => {

  const { hooks } = require('@feathersjs/authentication-local')
  const { passwordField } = validateOptions(props)

  return hooks.protect(passwordField)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default passwordProtect
