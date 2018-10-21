import { COPY, CIRCULAR } from './symbols'

/******************************************************************************/
// Shortcuts
/******************************************************************************/

const {
  getOwnPropertyNames,
  getOwnPropertySymbols,
  getOwnPropertyDescriptor,
  defineProperty
} = Object

/******************************************************************************/
// Helper
/******************************************************************************/

function copyPlainObject (object, refs) {

  const clone = { }

  const names = getOwnPropertyNames(object)
  const symbols = getOwnPropertySymbols(object)

  const keys = names.concat(symbols)

  for (const key of keys) {
    const descriptor = getOwnPropertyDescriptor(object, key)

    const hasValue = 'value' in descriptor // as opposed to a getter or setter
    if (hasValue)
      descriptor.value = copyConsideringRefs(descriptor.value, refs)

    if (!hasValue || descriptor.value !== CIRCULAR)
      defineProperty(clone, key, descriptor)
  }

  return clone
}

function getArgsFromIterable (value, refs) {

  const args = []

  for (const arg of value) {
    const result = copyConsideringRefs(arg, refs)
    if (result !== CIRCULAR)
      args.push(result)
  }

  return args
}

function copyConsideringRefs (value, refs) {

  if (value === null || typeof value !== 'object')
    return value

  if (typeof value[COPY] === 'function')
    return value[COPY]()

  if (typeof value.copy === 'function')
    return value.copy()

  if (value instanceof RegExp)
    return value

  if (!refs)
    refs = []

  if (refs.includes(value))
    return CIRCULAR

  refs.push(value)

  const isArray = value instanceof Array
  if (isArray || value instanceof Set || value instanceof Map) {
    const Type = value.constructor
    const args = getArgsFromIterable(value, refs)

    return isArray
      ? newArrayOfType(Type, args, refs)
      : new Type(args)
  }

  return copyPlainObject(value, refs)
}

function newArrayOfType (Type, array, refs) {

  const output = new Type(array.length)

  for (let i = 0; i < array.length; i++)
    output[i] = copyConsideringRefs(array[i], refs)

  return output
}

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Returns a recursive duplicate of the input.
 *
 * If the input has a symbolic COPY or string copy method, it's output is
 * returned.
 *
 * Otherwise, the copy is made by assigning string and symbol properties to new
 * objects.
 *
 * In the case of arrays, maps and sets, new instances are returned with their
 * iteration results as arguments.
 *
 * @param  {*} value Object or value to copy.
 * @return {*}       Copied value or object.
 */
function copy (...args) {

  const value = args.length > 0
    ? args[0]
    : this

  return copyConsideringRefs(value)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default copy
