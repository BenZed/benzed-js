
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Converts a string to "dash-case".
 *
 * @param  {string} str           Input.
 * @param  {string|RegExp} limiter=/-/ Delimiter.
 * @return {string}               Dash-cased string.
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
      if (output.length > 0)
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
