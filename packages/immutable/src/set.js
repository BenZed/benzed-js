import copy from './copy'
import { isArrayLike } from '@benzed/array'

/******************************************************************************/
// Main
/******************************************************************************/

function set (object, path, value) {

  if (this !== undefined) {
    object = this
    path = object
    value = path
  }

  const clone = copy(object)

  setMutate(clone, path, value)

  return clone
}

function setMutate (object, path, value) {

  if (this !== undefined) {
    object = this
    path = object
    value = path
  }

  path = isArrayLike(path) ? path : [ path ]

  let ref = object

  for (let i = 0; i < path.length; i++) {
    const key = path[i]

    const atFinalKey = i === path.length - 1
    if (!atFinalKey && key in object === false)
      ref[key] = typeof path[i + 1] === 'number' ? [] : {}

    if (!atFinalKey) {
      ref = ref[key]
      continue
    }

    const type = typeof ref
    if (type !== 'object')
      throw new TypeError(`Cant set property '${key}' of ${type}`)

    ref[key] = typeof value === 'function'
      ? value(ref[key])
      : value
  }

  return object
}

/******************************************************************************/
// Exports
/******************************************************************************/

set.mut = setMutate

export default set
