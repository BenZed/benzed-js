function capitalize (str) {

  if (typeof this === 'string')
    str = this

  return str.charAt(0).toUpperCase() + str.slice(1)
}

function toCamelCase (str, limiter = '-') {

  if (typeof this === 'string') {
    limiter = str || limiter
    str = this
  }

  let camelCased = ''
  let capitalizeNext = false

  for (let i = 0; i < str.length; i++) {

    const char = str.charAt(i)

    if (char === limiter)
      capitalizeNext = true

    else if (capitalizeNext) {
      camelCased += char.toUpperCase()
      capitalizeNext = false

    } else
      camelCased += char

  }

  return camelCased
}

function toDashCase (str) {

  if (typeof this === 'string')
    str = this



}

/******************************************************************************/
// Exports
/******************************************************************************/

export { capitalize, toCamelCase, toDashCase }
