import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

// TODO come up with a way for defaultValue to also be a function

function defaultTo (defaultValue) {

  const getDefaultValue = is(defaultValue, Function)
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
