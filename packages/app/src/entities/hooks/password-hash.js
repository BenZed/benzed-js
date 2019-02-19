import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validation
/******************************************************************************/

const validateOptions = <object key='hash-password' plain strict>
  <string key='passwordField' default='password'/>
  <func key='hash' />
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const passwordHash = props => {

  const { hooks } = require('@feathersjs/authentication-local')

  const options = validateOptions(props)

  return hooks.hashPassword(options)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default passwordHash
