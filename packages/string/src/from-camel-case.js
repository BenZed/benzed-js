
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * fromCamelCase converts a string to dash case
 *
 * @param  {string} str           input
 * @param  {string|RegExp} limiter = /-/ delimiter
 * @return {string}               dash cased string
 */
function fromCamelCase (str, joiner = '-') {

  if (this !== undefined) {
    joiner = str || joiner
    str = this
  }

  let output = ''

  for (let i = 0; i < str.length; i++) {

    let char = str.charAt(i)

    if (/[A-Z]/.test(char)) {
      output += joiner
      char = char.toLowerCase()
    }

    output += char

  }

  return output
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default fromCamelCase
