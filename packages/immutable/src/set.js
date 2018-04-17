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

  let ref = object

  const { length } = path
  const finalIndex = length - 1

  for (let i = 0; i < length; i++) {
    const key = path[i]

    const refType = typeof ref
    const refIsObject = refType === 'object' && ref !== null

    const atFinalKey = i === finalIndex
    if (!atFinalKey && refIsObject && key in ref === false)
      ref[key] = typeof path[i + 1] === 'number' ? [] : {}

    if (refIsObject && !atFinalKey) {
      ref = ref[key]
      continue
    }

    if (!refIsObject)
      throw new TypeError(`Cant set property '${key}' of ${ref}`)

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
