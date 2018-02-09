import VALUE from './symbols'

/******************************************************************************/
// Shortcuts
/******************************************************************************/

const {
  getOwnPropertyNames,
  getOwnPropertySymbols,
  getOwnPropertyDescriptor,
  defineProperty
} = Object

const { copy : copy_ } = VALUE

const { iterator, species } = Symbol

/******************************************************************************/
// Main
/******************************************************************************/

function copy (...args) {

  let object

  if (typeof this !== 'undefined')
    object = this
  else
    object = args.shift()

  if (object == null || typeof object !== 'object')
    return object

  if (copy_ in object)
    return object[copy_](...args)
  //
  // if (iterator in object) {
  //   const { constructor } = object
  //   const type = constructor[species] || constructor
  //
  //   if (type)
  //     return new type(...object)
  // }

  const clone = {}

  const names = getOwnPropertyNames(object)
  const symbols = getOwnPropertySymbols(object)

  const keys = names.concat(symbols)

  for (const key of keys) {
    const descriptor = getOwnPropertyDescriptor(object, key)
    defineProperty(clone, key, descriptor)
  }

  return clone
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default copy
