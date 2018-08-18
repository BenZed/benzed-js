/******************************************************************************/
// Data
/******************************************************************************/

const { indexOf } = Array.prototype

/******************************************************************************/
// Main
/******************************************************************************/

function adjacent (haystack, needle, delta = 1) {

  if (this !== undefined) {
    delta = needle || 1
    needle = haystack
    haystack = this
  }

  const { length } = haystack

  const index = haystack::indexOf(needle) + delta
  const indexWrapped = (index % length + length) % length

  return haystack[indexWrapped]
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default adjacent
