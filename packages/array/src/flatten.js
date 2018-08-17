import isArrayLike from './is-array-like'

/******************************************************************************/
// Main
/******************************************************************************/

function flatten (input) {

  if (this !== undefined)
    input = this

  const output = []

  for (let i = 0; i < input.length; i++) {
    const item = input[i]
    if (isArrayLike(item))
      output.push(...flatten(item))
    else
      output.push(item)
  }

  return output
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default flatten
