import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import is from 'is-explicit'
import hookGeneric from './hook'
/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validation
/******************************************************************************/

const validateStrategies = <array key='auth'
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

const hookAuth = props => {

  const { children, strategy } = props

  const { hooks } = require('@feathersjs/authentication')

  const strategies = validateStrategies(children || strategy)

  const authenticate = options => hooks.authenticate(options.strategy)

  return hookGeneric({
    strategy: strategies,
    func: authenticate
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default hookAuth
