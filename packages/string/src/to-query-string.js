
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * toQueryString - Description
 *
 * @param {Object} obj Description
 *
 * @return {string} Description
 */
function toQueryString (obj) {
  console.warn('use the core querystring module')
  if (this !== undefined)
    obj = this

  const terms = []
  for (const key in obj) {
    const term = `${key}=${obj[key]}`
    terms.push(term)
  }

  return terms.length > 0
    ? `?${terms.join('&')}`
    : ''

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default toQueryString
