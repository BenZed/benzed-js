
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

  if (this !== undefined)
    object = this

  const type = typeof object

  return type === 'string' ||
    (
      type === 'object' &&
      object !== null &&
      typeof object.length === 'number'
    )
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default isArrayLike
