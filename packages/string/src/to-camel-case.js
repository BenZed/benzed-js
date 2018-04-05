
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * converts a string to camel case
 *
 * @param  {string} str           input
 * @param  {string|RegExp} limiter = /-/ delimiter
 * @return {string}               camel cased string
 */
function toCamelCase (str, limiter = /-/) {

  if (this !== undefined) {
    limiter = str || limiter
    str = this
  }

  let camelCased = ''
  let capitalizeNext = false

  if (typeof limiter === 'string')
    limiter = new RegExp(limiter.split('').join('|'))

  if (limiter instanceof RegExp === false)
    throw new Error('limiter must be a string or RegExp object')

  for (let i = 0; i < str.length; i++) {

    const char = str.charAt(i)

    if (limiter.test(char))
      capitalizeNext = true

    else if (capitalizeNext) {
      camelCased += char.toUpperCase()
      capitalizeNext = false

    } else
      camelCased += char

  }

  return camelCased
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default toCamelCase
