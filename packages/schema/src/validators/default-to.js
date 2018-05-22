import is from 'is-explicit'
import argsToConfig from '../util/args-to-config'

/******************************************************************************/
// Helper
/******************************************************************************/

const defaultConfig = argsToConfig(
  [{
    name: 'value',
    test: is.defined,
    required: true
  },
  {
    name: 'call',
    test: is.bool,
    default: true
  }
  ])

/******************************************************************************/
// Main
/******************************************************************************/

function defaultTo (args) {

  const { value: defaultValue, call } = defaultConfig(args)

  const getDefaultValue = call && is(defaultValue, Function)
    ? defaultValue
    : () => defaultValue

  const defaultTo = (value, context) => {
    const result = value == null

      ? getDefaultValue(context)
      : value

    return result
  }

  return defaultTo
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default defaultTo
