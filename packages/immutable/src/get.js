import { isArrayLike } from '@benzed/array'

/******************************************************************************/
// Main
/******************************************************************************/

function get (object, path) {

  if (this !== undefined) {
    object = this
    path = object
  }

  path = isArrayLike(path) ? path : [ path ]

  // if (obj != null && typeof obj.get === 'function')
  //   return obj.get(...keys)

  let value
  let ref = object

  for (let i = 0; i < path.length; i++) {

    const key = path[i]

    const atFinalKey = i === path.length - 1
    if (atFinalKey)
      value = ref[key]

    else if (typeof ref[key] !== 'object')
      break

    else
      ref = ref[key]
  }

  return value
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default get
