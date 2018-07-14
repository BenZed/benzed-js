
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Capitalizes a string.
 *
 * @param  {string} str Source string.
 * @return {string}     Capitalized string.
 */
function capitalize (str) {

  if (this !== undefined)
    str = this

  return str.charAt(0).toUpperCase() + str.slice(1)
}
/******************************************************************************/
// Exports
/******************************************************************************/

export default capitalize
