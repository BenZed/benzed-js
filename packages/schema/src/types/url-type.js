import StringType from './string-type'

// import { define, propToConfig, propIsEnabled } from '../util'

// TODO extend string type to validate urls, and in the node environment,
// determine where they are in the file system.

/******************************************************************************/
// Main
/******************************************************************************/

class UrlType extends StringType {

  sync () {}

  file () {}

  dir () {}

  ensure () {}

  protocol () {}

  exists () {}

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default UrlType
