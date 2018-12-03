import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import is from 'is-explicit'
import { hooks as authHooks } from '@feathersjs/authentication'
import hookGeneric from './hook'
/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const authenticate = options => authHooks.authenticate(options.strategy)

/******************************************************************************/
// Validation
/******************************************************************************/

const validateStrategies = <array key='auth'
  length={['>', 0]}
  required
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

  const strategies = validateStrategies(children || strategy)

  return hookGeneric({
    strategy: strategies,
    func: authenticate
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default hookAuth