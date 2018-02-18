
/******************************************************************************/
// Main
/******************************************************************************/

function get (...args) {

  const obj = this !== undefined
    ? this
    : args.shift()

  const keys = args

  // if (obj != null && typeof obj.get === 'function')
  //   return obj.get(...keys)

  let value
  let ref = obj

  for (let i = 0; i < keys.length; i++) {

    const key = keys[i]

    const atFinalKey = i === keys.length - 1
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
