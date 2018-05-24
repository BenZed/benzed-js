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
    test: is.bool
  }],
  'defaultTo')

/******************************************************************************/
// Main
/******************************************************************************/

function defaultTo (...args) {

  const { value, call } = defaultConfig(args)

  const valueIsFunc = is.func(value)
  if (!valueIsFunc && call)
    throw new Error('defaultTo config.call cannot be enabled if config.value is not a function')

  const getValue = call !== false && valueIsFunc
    ? value
    : () => value

  const defaultTo = (value, context) => {
    const result = value == null

      ? getValue(context)
      : value

    return result
  }

  return defaultTo
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default defaultTo
