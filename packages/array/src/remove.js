
const { indexOf, splice } = Array.prototype

/******************************************************************************/
// Main
/******************************************************************************/

function remove (input, value) {

  if (this !== undefined) {
    value = input
    input = this
  }

  const inputIndexOf = input::indexOf
  let inputSplice

  let index

  do {

    index = inputIndexOf(value)
    if (index > -1) {
      inputSplice = inputSplice || input::splice
      inputSplice(index, 1)
    }

  } while (index >= 0)

  return input

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default remove
