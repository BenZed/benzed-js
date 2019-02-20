import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import is from 'is-explicit'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validation
/******************************************************************************/

const validateStrategies = <array
  key='auth'
  length={['>', 0]}
  required
  default={['jwt']}
  cast={v => is.string(v)
    ? v.split(' ')
    : v}>

  <string key='strategy' required/>

</array>

/******************************************************************************/
// Main
/******************************************************************************/

const authenticateHook = props => {

  const { children, strategy } = props
  const strategies = validateStrategies(children || strategy)
  const { hooks } = require('@feathersjs/authentication')

  return hooks.authenticate(strategies)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default authenticateHook
