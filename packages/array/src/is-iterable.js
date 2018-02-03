
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Is an object iterable?
 *
 * @param  {*} object
 * @return {boolean}   True if input has Symbol.iterator
 */
function isIterable (object) {

  if (arguments.length === 0)
    object = this

  return object != null &&
    typeof object[Symbol.iterator] === 'function'
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default isIterable
