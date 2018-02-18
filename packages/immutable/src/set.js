import copy from './copy'

/******************************************************************************/
// Main
/******************************************************************************/

function set (...args) {

  const obj = typeof this !== 'undefined'
    ? this
    : args.shift()

  const clone = copy(obj)

  setMutate(clone, ...args)

  return clone
}

function setMutate (...args) {

  const obj = this !== undefined
    ? this
    : args.shift()

  // if (obj != null && typeof obj.set === 'function')
  //   return obj.set(...args)

  if (args.length < 2)
    throw new Error('cannot set without at least one key and value')

  const value = args.pop()
  const keys = args

  let ref = obj

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]

    const atFinalKey = i === keys.length - 1
    if (!atFinalKey && key in obj === false)
      ref[key] = typeof keys[i + 1] === 'number' ? [] : {}

    if (!atFinalKey) {
      ref = ref[key]
      continue
    }

    const type = typeof ref
    if (type !== 'object')
      throw new TypeError(`Cant set property '${key}' of ${type}`)

    ref[key] = value
  }

  return obj
}

/******************************************************************************/
// Exports
/******************************************************************************/

set.mut = setMutate

export default set
