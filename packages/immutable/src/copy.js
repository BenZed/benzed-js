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

const CIRCULAR = Symbol('circular-reference')

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

    if ('value' in descriptor)
      descriptor.value = copyConsideringReferences(descriptor.value, refs)

    if (descriptor.value !== CIRCULAR)
      defineProperty(clone, key, descriptor)

  }

  return clone
}

function copyConsideringReferences (value, refs) {

  if (value === null || typeof value !== 'object')
    return value

  if (typeof value[COPY] === 'function')
    return value[COPY]()

  if (typeof value.copy === 'function')
    return value.copy()

  if (!refs)
    refs = []

  if (refs.includes(value))
    return CIRCULAR

  refs.push(value)

  const isArray = value instanceof Array
  if (isArray || value instanceof Set || value instanceof Map) {
    const Type = value.constructor
    const args = [...value]
      .map(v => copyConsideringReferences(v, refs))
      .filter(v => v !== CIRCULAR)

    return isArray ? new Type(...args) : new Type(args)
  }

  return copyPlainObject(value, refs)
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

  return copyConsideringReferences(value)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default copy
