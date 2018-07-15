
import copy from './copy'
import equals from './equals'
import {
  isArrayLike,
  shuffle as shuffleMutable
} from '@benzed/array'

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

/**
 * Immutable version of Array.prototype.push.
 * Input Array is unscathed.
 *
 * @param {Array} obj       Array or ArrayLike to copy.
 * @param {*}     ...items  Items to push.
 * @return {Array}          Copied Array with pushed items.
 */
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

/**
 * pop - Description
 *
 * @param {type} arr Description
 *
 * @return {type} Description
 */
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

/**
 * shift - Description
 *
 * @param {type} arr Description
 *
 * @return {type} Description
 */
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

/**
 * unshift - Description
 *
 * @param {array} args Description
 *
 * @return {type} Description
 */
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

/**
 * splice - Description
 *
 * @param {array} args Description
 *
 * @return {type} Description
 */
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

/**
 * reverse - Description
 *
 * @param {type} arr Description
 *
 * @return {type} Description
 */
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

/**
 * sort - Description
 *
 * @param {type} arr  Description
 * @param {type} func Description
 *
 * @return {type} Description
 */
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

/**
 * shuffle - Description
 *
 * @param {type} arr Description
 *
 * @return {type} Description
 */
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

/**
 * unique - Description
 *
 * @param {type} arr Description
 *
 * @return {type} Description
 */
export function unique (arr) {

  if (this !== undefined)
    arr = this

  const clone = copy(arr)

  assertArrayLike(clone, 'unique')

  const cloneSplice = clone::proto.splice

  const spliceIndexes = []

  for (let i = 0; i < clone.length; i++) {
    const item = arr[i]
    let exists = false

    for (let c = 0; c < i; c++) {
      const check = clone[c]
      if (equals(item, check)) {
        exists = true
        break
      }
    }

    if (exists)
      spliceIndexes.push(i)
  }

  for (let i = spliceIndexes.length - 1; i >= 0; i--)
    cloneSplice(spliceIndexes[i], 1)

  return clone

}

/******************************************************************************/
// Array lookup methods that use value equality rather than reference equality
/******************************************************************************/

/**
 * includes - Description
 *
 * @param {type} arr   Description
 * @param {type} value Description
 *
 * @return {type} Description
 */
export function includes (arr, value) {

  if (this !== undefined) {
    value = arr
    arr = this
  }

  return indexOf(arr, value) > -1
}

/**
 * indexOf - Description
 *
 * @param {type} arr   Description
 * @param {type} value Description
 *
 * @return {type} Description
 */
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

/**
 * lastIndexOf - Description
 *
 * @param {type} arr   Description
 * @param {type} value Description
 *
 * @return {type} Description
 */
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
