import is from 'is-explicit'
import argsToConfig from '../util/args-to-config'

/******************************************************************************/
// Config
/******************************************************************************/

const formatConfig = argsToConfig([
  {
    name: 'regex',
    test: RegExp::is,
    required: true
  },
  {
    name: 'err',
    test: is.string,
    default: 'Incorrect Format.'
  }
], 'format')

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * format - Description
 *
 * @param {array} args Description
 *
 * @return {type} Description
 */
function format (...args) {

  const { err, regex } = formatConfig(args)

  return value =>
    !is.string(value) || regex.test(value)
      ? value
      : Error(err)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default format
