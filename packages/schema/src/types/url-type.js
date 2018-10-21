import StringType from './string-type'

// import { define, propToConfig, propIsEnabled } from '../util'

/******************************************************************************/
// Main
/******************************************************************************/

class UrlType extends StringType {

  file () { }

  dir () { }

  ensure () { }

  protocol () { }

  exists () { }

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default UrlType
