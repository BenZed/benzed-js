import SpecificType from './specific-type'
import is from 'is-explicit'

import { addName, propToConfig, propIsEnabled } from '../util'

/******************************************************************************/
// Validator Config
/******************************************************************************/

const formatConfig = propToConfig([
  {
    name: 'regexp',
    test: RegExp::is,
    required: true
  }, {
    name: 'err',
    test: is.string,
    default: 'invalid format.'
  }
])

/******************************************************************************/
// Default Cast
/******************************************************************************/

const toString = value =>

  is.object(value) &&
  is.func(value.toString) &&
  value.toString !== Object.prototype.toString

    ? value.toString()
    : is.primitive(value)

      ? String(value)
      : value

/******************************************************************************/
// Main
/******************************************************************************/

class StringType extends SpecificType {

  constructor () {
    super(String)
  }

  cast (prop) {

    if (prop === true)
      prop = toString

    return super.cast(prop)
  }

  format (prop) {
    if (!propIsEnabled(prop))
      return null

    const { regexp, err } = prop = formatConfig(prop)

    const validator = value => !is.defined(value) || regexp.test(value)
      ? value
      : throw new Error(err)

    validator::addName(`formatAs::${regexp.toString()}`)

    return {
      validator,
      prop
    }
  }

  uppercase (prop) {
    if (!propIsEnabled(prop))
      return null

    const validator = value => is.string(value)
      ? value.toUpperCase()
      : value

    return validator::addName('toUppercase')
  }

  lowercase (prop) {
    if (!propIsEnabled(prop))
      return null

    const validator = value => is.string(value)
      ? value.toLowerCase()
      : value

    return validator::addName('toLowercase')
  }

  // Canned Format Validators

  // trim () {}

  // email () {}

  // phone () {}

  // alpha () {}

  // numeric () {}

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default StringType
