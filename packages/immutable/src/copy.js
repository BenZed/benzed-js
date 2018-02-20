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

function copy (...args) {

  const value = typeof this !== 'undefined'
    ? this
    : args.shift()

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
