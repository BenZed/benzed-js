import isEnabled from '../is-enabled'
import { propToConfig } from '@benzed/schema'
import is from 'is-explicit'

/******************************************************************************/
// Config
/******************************************************************************/

const mustBeEnabledConfig = propToConfig([
  {
    name: 'err',
    test: is.string,
    default: 'Must be enabled.'
  }
])

/******************************************************************************/
//
/******************************************************************************/

function mustBeEnabled (prop) {

  const config = mustBeEnabledConfig(prop)

  const mustBeEnabled = value => isEnabled(value)
    ? value
    : throw new Error(config.err)

  return mustBeEnabled
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default mustBeEnabled
