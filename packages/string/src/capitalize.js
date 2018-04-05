
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * capitalizes a string
 *
 * @param  {string} str description
 * @return {string}     description
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
