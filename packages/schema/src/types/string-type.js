import SpecificType from './specific-type'
import is from 'is-explicit'

import { define, propToConfig, propIsEnabled } from '../util'

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

    validator::define({
      name: 'format', priority: -20
    })

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

    // TODO maybe throw if uppercase and lowercase are defined on the same schema?

    return validator::define({
      name: 'uppercase', priority: -25
    })
  }

  lowercase (prop) {
    if (!propIsEnabled(prop))
      return null

    const validator = value => is.string(value)
      ? value.toLowerCase()
      : value

    // TODO maybe throw if uppercase and lowercase are defined on the same schema?

    return validator::define({
      name: 'lowercase', priority: -25
    })
  }

  trim (prop) {
    if (!propIsEnabled(prop))
      return null

    const validator = value => is.string(value)
      ? value.trim()
      : value

    return validator::define({
      name: 'trim', priority: -25
    })
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
