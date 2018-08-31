import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function isEnabled (value) {
  return value === true || (is.plainObject(value) && value.enabled !== false)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default isEnabled
