
/******************************************************************************/
// Main
/******************************************************************************/

// TODO come up with a way for defaultValue to also be a function

function defaultTo (defaultValue) {

  return value => value == null

    ? defaultValue
    : value

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default defaultTo
