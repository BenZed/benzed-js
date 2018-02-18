
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Is an object ArrayLike?
 *
 * @param  {*} object
 * @return {boolean}   True if input has numeric length property
 */
function isArrayLike (object) {

  if (arguments.length === 0)
    object = this

  return object !== null &&
    typeof object.length === 'number'
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default isArrayLike
