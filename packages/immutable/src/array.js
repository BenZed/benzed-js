
import copy from './copy'
import equals from './equals'
import { isArrayLike, shuffle as shuffleMutable } from '@benzed/array'

/******************************************************************************/
// Data
/******************************************************************************/

const proto = Array.prototype

/******************************************************************************/
// Helper
/******************************************************************************/

const { isArray } = Array

function assertArrayLike (arr, name) {
  if (!isArrayLike(arr))
    throw new Error(name + ' must be called on an array-like object')

  return true
}

/******************************************************************************/
// Immutable versions of array methods
/******************************************************************************/

export function push (...args) {

  const arr = this !== undefined
    ? this
    : args.shift()

  const clone = copy(arr)

  if (isArray(clone))
    clone.push(...args)
  else if (assertArrayLike(clone, 'push'))
    clone::proto.push(...args)

  return clone
}

export function pop (arr) {

  if (this !== undefined)
    arr = this

  const clone = copy(arr)

  if (isArray(clone))
    clone.pop()
  else if (assertArrayLike(clone, 'pop'))
    clone::proto.pop()

  return clone
}

export function shift (arr) {

  if (this !== undefined)
    arr = this

  const clone = copy(arr)

  if (isArray(clone))
    clone.shift()
  else if (assertArrayLike(clone, 'shift'))
    clone::proto.shift()

  return clone
}

export function unshift (...args) {

  const arr = this !== undefined
    ? this
    : args.shift()

  const clone = copy(arr)

  if (isArray(clone))
    clone.unshift(...args)
  else if (assertArrayLike(clone, 'unshift'))
    clone::proto.unshift(...args)

  return clone
}

export function splice (...args) {

  const arr = this !== undefined
    ? this
    : args.shift()

  const clone = copy(arr)

  if (isArray(clone))
    clone.splice(...args)
  else if (assertArrayLike(clone, 'splice'))
    clone::proto.splice(...args)

  return clone
}

export function reverse (arr) {

  if (this !== undefined)
    arr = this

  const clone = copy(arr)

  if (isArray(clone))
    clone.reverse()
  else if (assertArrayLike(clone, 'reverse'))
    clone::proto.reverse()

  return clone
}

export function sort (arr, func) {

  if (this !== undefined) {
    func = arr
    arr = this
  }

  const clone = copy(arr)

  if (isArray(clone))
    clone.sort(func)
  else if (assertArrayLike(clone, 'sort'))
    clone::proto.sort(func)

  return clone
}

export function shuffle (arr) {

  if (this !== undefined)
    arr = this

  const clone = copy(arr)

  shuffleMutable(clone)

  return clone
}

/******************************************************************************/
// Array lookup methods that use value equality rather than reference equality
/******************************************************************************/

export function includes (arr, value) {

  if (this !== undefined) {
    value = arr
    arr = this
  }

  return indexOf(arr, value) > -1
}

export function indexOf (arr, value) {

  if (this !== undefined) {
    value = arr
    arr = this
  }

  assertArrayLike(arr, 'indexOf')

  for (let i = 0; i < arr.length; i++)
    if (equals(arr[i], value))
      return i

  return -1
}

export function lastIndexOf (arr, value) {

  if (this !== undefined) {
    value = arr
    arr = this
  }

  assertArrayLike(arr, 'lastIndexOf')

  for (let i = arr.length - 1; i >= 0; i--)
    if (equals(arr[i], value))
      return i

  return -1
}
