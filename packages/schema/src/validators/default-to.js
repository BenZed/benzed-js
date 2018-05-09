
/******************************************************************************/
// Main
/******************************************************************************/

// TODO come up with a way for defaultValue to also be a function

function defaultTo (defaultValue) {

  return value => {
    const result = value == null

      ? defaultValue
      : value

    return result
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default defaultTo
