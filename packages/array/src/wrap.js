/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Wraps an input in an Array, if it isn't an array already.
 *
 * @param  {type} arr Object to wrap.
 * @return {type}     If input is an array, returns the input, otherwise returns
 *                    an array with the input as the first value.
 */
function wrap (arr) {

  if (this !== undefined)
    arr = this

  return Array.isArray(arr)
    ? arr
    : [ arr ]
}

/**
 * Unwraps an array.
 *
 * @param  {type} arr Object to unwrap.
 * @return {type}     If input is an array, returns the first value, otherwise
 *                    returns the input.
 */
function unwrap (arr) {

  if (this !== undefined)
    arr = this

  return Array.isArray(arr)
    ? arr[0]
    : arr
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default wrap

export { wrap, unwrap }
