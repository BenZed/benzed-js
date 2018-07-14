/******************************************************************************/
// Data
/******************************************************************************/

const { indexOf } = Array.prototype

/******************************************************************************/
// Main
/******************************************************************************/

/**
* Finds the given value in an array, then returns the adjacent value.
* Adjacent values are wrapped if the next index is out of range.
* Can also be bound, in which case the first argument would be shifted to 'this'
*
* @param {Array|Object} haystack  Array or ArrayLike haystack
* @param {*}            needle    Value to get adjacent of
* @param {number}      [delta=1]  Number of neighbouring indexes to jump
*
* @return {*}                     Adjacent Value
*/
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
