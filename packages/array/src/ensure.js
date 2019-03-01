
const { indexOf, push } = Array.prototype

/******************************************************************************/
// Main
/******************************************************************************/

function ensure (input, value) {

  if (this !== undefined) {
    value = input
    input = this
  }

  const index = input::indexOf(value)
  if (index === -1)
    input::push(value)

  return input

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ensure
