import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

// Validates that a string is formatted according to a regex
// TODO this should be using a argsToConfig function
function format (regex, err) {

  if (!is(regex, RegExp))
    throw new Error('format() must be configured with a regular expression')

  err = err || 'Incorrect Format.'

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
