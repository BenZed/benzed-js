
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * fromQueryString - Description
 *
 * @param {string} str Description
 *
 * @return {Object} Description
 */
function fromQueryString (str) {
  console.warn('use the core querystring module')
  if (this !== undefined)
    str = this

  const query = {}

  const terms = str.split(/\?|&/)
  for (const term of terms) {
    const [ key, value ] = term.split('=')

    if (key)
      query[key] = value
  }

  return query

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default fromQueryString
