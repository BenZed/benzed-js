import copy from './copy'

/******************************************************************************/
// Main
/******************************************************************************/

function set (object, path, value) {

  if (this !== undefined) {
    value = path
    path = object
    object = this
  }

  const clone = copy(object)

  return setMutate(clone, path, value)

}

function setMutate (object, path, value) {

  if (this !== undefined && this !== set) {
    value = path
    path = object
    object = this
  }

  path = path instanceof Array ? path : [ path ]

  const isObject = typeof object === 'object' && object !== null
  if (!isObject)
    throw new TypeError(`Cant set property '${path}' of ${object}`)

  let ref = object

  const { length } = path
  const finalIndex = length - 1

  for (let i = 0; i < length; i++) {
    const key = path[i]

    const type = typeof ref[key]

    const atFinalKey = i === finalIndex
    if (!atFinalKey && ((type !== 'function' && type !== 'object') || ref[key] === null))
      ref[key] = typeof path[i + 1] === 'number' ? [] : {}

    if (!atFinalKey) {
      ref = ref[key]
      continue
    }

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
