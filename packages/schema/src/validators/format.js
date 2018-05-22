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
])

/******************************************************************************/
// Main
/******************************************************************************/

function format (...args) {

  const { err, regex } = formatConfig(args)

  return value => {
    if (value == null)
      return value

    if (!is(value, String) || !regex.test(value))
      return Error(err)

    return value
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default format
