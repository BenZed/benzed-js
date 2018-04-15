import { COPY } from './symbols'

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

function copyPlainObject (object) {

  const clone = { }

  const names = getOwnPropertyNames(object)
  const symbols = getOwnPropertySymbols(object)

  const keys = names.concat(symbols)

  for (const key of keys) {

    const descriptor = getOwnPropertyDescriptor(object, key)

    if ('value' in descriptor)
      descriptor.value = copy(descriptor.value)

    defineProperty(clone, key, descriptor)

  }

  return clone
}

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Returns a recursive duplicate of the input.
 *
 * If the input has a symbolic COPY or string 'copy' method, it's out put is returned.
 * Otherwise, the copy is made by assigning string and symbol properties to new objects.
 * In the case of arrays, maps and sets, new instances are returned with their iteration
 * results as arguments.
 *
 * @param  {*} value object or value to copy
 * @return {*}       copied value or object
 */
function copy (value) {

  if (this !== undefined)
    value = this

  if (value === null || typeof value !== 'object')
    return value

  if (typeof value[COPY] === 'function')
    return value[COPY]()

  if (typeof value.copy === 'function')
    return value.copy()

  const isArray = value instanceof Array

  if (isArray || value instanceof Set || value instanceof Map) {
    const Type = value.constructor
    const args = [...value].map(copy)

    return isArray ? new Type(...args) : new Type(args)
  }

  return copyPlainObject(value)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default copy
