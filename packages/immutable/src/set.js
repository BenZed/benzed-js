import copy from './copy'

/******************************************************************************/
// Helper
/******************************************************************************/

const isSettable = value => {

  const type = typeof value
  return type === 'function' || (type === 'object' && value !== null)

}

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * set - Description
 *
 * @param {type} object Description
 * @param {type} path   Description
 * @param {type} value  Description
 *
 * @return {type} Description
 */
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

  if (!isSettable(object))
    throw new TypeError(`Cant set property '${path}' of ${object}`)

  let ref = object

  const { length } = path

  for (let i = 0; i < length; i++) {
    const key = path[i]

    const atFinalKey = i === length - 1
    if (!atFinalKey && !isSettable(ref[key]))
      ref[key] = typeof path[i + 1] === 'number' ? [] : {}

    if (!atFinalKey) {
      ref = ref[key]
      continue
    }

    ref[key] = value
  }

  return length === 0 ? value : object
}

/******************************************************************************/
// Exports
/******************************************************************************/

set.mut = setMutate

export default set
