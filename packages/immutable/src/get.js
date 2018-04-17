import copy from './copy'

/******************************************************************************/
// Main
/******************************************************************************/

function get (object, path) {

  if (this !== undefined) {
    path = object
    object = this
  }

  const value = getMutate(object, path)

  return copy(value)
}

function getMutate (object, path) {

  if (this !== undefined && this !== get) {
    path = object
    object = this
  }

  path = path instanceof Array ? path : [ path ]

  // if (obj != null && typeof obj.get === 'function')
  //   return obj.get(...keys)

  let value
  let ref = object

  const { length } = path
  const finalIndex = length - 1

  for (let i = 0; i < length; i++) {

    if (typeof ref !== 'object' || ref === null)
      break

    const key = path[i]

    const atFinalKey = i === finalIndex
    if (atFinalKey)
      value = ref[key]

    else
      ref = ref[key]
  }

  return value
}

/******************************************************************************/
// Exports
/******************************************************************************/

get.mut = getMutate

export default get
