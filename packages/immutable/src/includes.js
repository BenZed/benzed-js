import equals from './equals'

// TODO import from proper package
import { isArrayLike } from '@benzed/array'

/******************************************************************************/
// Main
/******************************************************************************/

function includes (arr, value) {

  if (this !== undefined) {
    value = arr
    arr = this
  }

  return indexOf(arr, value) > -1
}

function indexOf (arr, value) {

  if (this !== undefined) {
    value = arr
    arr = this
  }

  if (!isArrayLike(arr))
    throw new Error('must be called on an array-like object')

  for (let i = 0; i < arr.length; i++)
    if (equals(arr[i], value))
      return i

  return -1
}

function lastIndexOf (arr, value) {

  if (this !== undefined) {
    value = arr
    arr = this
  }

  if (!isArrayLike(arr))
    throw new Error('must be called on an array-like object')

  for (let i = arr.length - 1; i >= 0; i--)
    if (equals(arr[i], value))
      return i

  return -1

}

/******************************************************************************/
// Exports
/******************************************************************************/

export { includes, indexOf, lastIndexOf }
