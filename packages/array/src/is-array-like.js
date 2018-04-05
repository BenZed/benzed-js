
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Does an object have a numeric length?
 *
 * @param  {*} object
 * @return {boolean}   True if input has numeric length property
 */
function hasNumericLength (object) {

  if (this !== undefined)
    object = this

  return object != null &&
    typeof object.length === 'number'
}

/**
 * Is the input an array-like object? Distinct from hasNumericLength because this
 * method only returns true for objects with a length property.
 * Primitive strings will return false, but boxed strings will return true.
 *
 * @param  {*} object
 * @return {boolean}   True if input is an object with numeric length property
 */
function isArrayLike (object) {

  if (this !== undefined)
    object = this

  return object !== null &&
    typeof object === 'object' &&
    typeof object.length === 'number'
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default isArrayLike

export { hasNumericLength, isArrayLike }
