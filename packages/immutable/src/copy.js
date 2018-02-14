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

  if (value instanceof Array)
    return value.map(copy)

  return copyPlainObject(value)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default copy
