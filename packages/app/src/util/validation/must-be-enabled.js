import isEnabled from '../is-enabled'
import { OPTIONAL_CONFIG, argsToConfig } from '@benzed/schema'
import is from 'is-explicit'

/******************************************************************************/
// Config
/******************************************************************************/

const mustBeEnabledConfig = argsToConfig([
  {
    name: 'err',
    test: is.string,
    default: 'Must be enabled.'
  }
])

/******************************************************************************/
//
/******************************************************************************/

function mustBeEnabled (...args) {

  const config = mustBeEnabledConfig(args)

  const mustBeEnabled = value => isEnabled(value)
    ? value
    : new Error(config.err)

  return mustBeEnabled
}

mustBeEnabled[OPTIONAL_CONFIG] = true

/******************************************************************************/
// Exports
/******************************************************************************/

export default mustBeEnabled
