import SpecificType from './specific-type'
import is from 'is-explicit'

import addName from '../util/add-name'
import propToConfig from '../util/prop-to-config'
import propIsEnabled from '../util/prop-is-enabled'

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

    const { regexp, err } = this.props.format = formatConfig(prop)

    const validator = value => !is.defined(value) || regexp.test(value)
      ? value
      : throw new Error(err)

    return validator::addName(`formatAs::${regexp.toString()}`)
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

  // email () {}

  // phone () {}

  // alpha () {}

  // numeric () {}

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default StringType
