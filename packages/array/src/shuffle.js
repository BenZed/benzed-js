import { randomBytes } from 'crypto'

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Randomly re-arranges a given array. Can also be bound.
 *
 * @param  {Array} array Array to be sorted.
 * @return {Array}       Array is mutated in place, but method returns it anyway.
 */
function shuffle (array) {

  if (this !== undefined)
    array = this

  let index = array.length

  const inputIsString = typeof array === 'string'
  if (inputIsString)
    array = array.split('')

  const buffer = randomBytes(array.length)

  while (index > 0) {

    const byte = buffer[index - 1]

    const randomIndex = Math.floor((byte / 255) * index)

    index--

    const temp = array[index]
    array[index] = array[randomIndex]
    array[randomIndex] = temp

  }

  if (inputIsString)
    array = array.join('')

  return array

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default shuffle
