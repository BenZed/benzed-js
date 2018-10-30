import StringType from './string-type'
import is from 'is-explicit'

import { define, propToConfig, propIsEnabled } from '../util'

// TODO extend string type to validate urls, and in the node environment,
// determine where they are in the file system.

/******************************************************************************/
// Data
/******************************************************************************/

/* eslint-disable no-useless-escape */

const PROTOCOL_AND_DOMAIN = /^(?:\w+:)?\/\/(\S+)$/
const LOCALHOST_AND_DOMAIN = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/
const NONLOCAL_AND_DOMAIN = /^[^\s\.]+\.\S{2,}$/

/******************************************************************************/
// Configuration
/******************************************************************************/

const fileConfig = propToConfig([
  {
    name: 'exts',
    test: [
      is.string,
      ext => ext.indexOf('.') === 0
    ],
    count: Infinity
  },
  {
    name: 'error',
    test: is.string,
    default: 'file does not exist.'
  }
])

/******************************************************************************/
// Helper
/******************************************************************************/

function isUrl (string) {

  const match = string.match(PROTOCOL_AND_DOMAIN)
  if (!match)
    return false

  const everythingAfterProtocol = match[1]
  if (!everythingAfterProtocol)
    return false

  if (LOCALHOST_AND_DOMAIN.test(everythingAfterProtocol) ||
      NONLOCAL_AND_DOMAIN.test(everythingAfterProtocol))
    return true

  return false
}

/******************************************************************************/
// Main
/******************************************************************************/

class UrlType extends StringType {

  isBrowser = typeof window === 'object'

  file (prop, props) {
    if (!propIsEnabled(prop) || this.isBrowser)
      return null

    const { error, exts } = prop = fileConfig(prop)

    // const sync = propIsEnabled(props.sync)

    const validator = value => {

      if (!is.defined(value))
        return value

    }

    validator::define({
      name: 'isFile'
    })

    return {
      validator,
      prop
    }

  }

  dir () {}

  protocol () {}

  exists () {}

  sync () {}

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default UrlType
