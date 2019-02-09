import { $$copy } from './symbols'
import { namesAndSymbols } from './equals'

console.warn(
  'TO BEN: Do not publish @benzed/immutable 3.0 yet.\n\n' +
  '- circular reference resolution for all object types, not just plain objects.\n' +
  '- default Object $$copy implementation: should it have one or not?\n',
  '- should objects without prototypes also be copied without prototypes?\n',
  '- if an input is frozen, sealed or not extendable, should the output be as well?'
)

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperty } = Object

function addToPrototype (copier) {

  const Type = this

  defineProperty(Type.prototype, $$copy, {
    value: copier,
    writable: true
  })

}

const prototypeIsBaseObjectOrMissing = object => {
  const prototype = Object.getPrototypeOf(object)
  return prototype === null || prototype.constructor === Object
}

const copyObjectConsideringCircularRefs = (value, refs) => {

  let clone

  try {
    clone = value.constructor
      ? new value.constructor()
      : Object.create(null)
  } catch (err) {
    clone = {}
  }

  if (refs instanceof Map === false)
    refs = new Map([ [ value, clone ] ])

  const keys = namesAndSymbols(value)
  for (const key of keys) {
    const keyValue = value[key]

    const isObject = keyValue !== null && typeof keyValue === 'object'
    const hasCircularReference = isObject && refs.has(keyValue)

    clone[key] = hasCircularReference
      ? refs.get(keyValue)
      : copyWithImplementation(keyValue, refs)

    if (isObject && !hasCircularReference)
      refs.set(keyValue, clone[key])

  }

  return clone
}

const copyWithImplementation = value => {

  const isNullOrUndefined = value == null

  return !isNullOrUndefined && typeof value[$$copy] === 'function'
    ? value[$$copy]()
    : isNullOrUndefined
      ? value
      : prototypeIsBaseObjectOrMissing(value)
        ? copyObjectConsideringCircularRefs(value)
        : throw new Error(`${value.constructor?.name || 'value'} does not implement $$copy trait.`)
}

/******************************************************************************/
// Implementations
/******************************************************************************/

function returnSelf () {
  return this
}

function copyObject () {
  return copyObjectConsideringCircularRefs(this)
}

function copyArray () {
  return this.map(copyWithImplementation) // lol
}

function copyDate () {
  const Date = this.constructor
  return new Date(this.getTime())
}

function copyIterable () {
  const Type = this.constructor

  const args = []

  for (const value of this)
    args.push(copyWithImplementation(value))

  return new Type(args)
}

/******************************************************************************/
// Apply Implementations
/******************************************************************************/

for (const Primitive of [ String, Number, Boolean ])
  Primitive::addToPrototype(returnSelf)

for (const Immutable of [ RegExp, Symbol, Function ])
  Immutable::addToPrototype(returnSelf)

// TODO Should WeakCollections not implement $$copy?
// for (const WeakCollection of [ WeakSet, WeakMap ])
//   WeakCollection::addToPrototype(returnSelf)

for (const Iterable of [ Set, Map ])
  Iterable::addToPrototype(copyIterable)

// On second thought, we don't want custom types to inherit $$copy functionality
// unless we explicitly ask them to.
// Object::addToPrototype(copyObject)

Date::addToPrototype(copyDate)

for (const ArrayType of [
  // fun fact, copyObject actually works with the standard array type,
  // but the copyArray implementation we have here is much faster
  Array,

  // the rest of the typed arrays, however, break using copyObject, so
  // they need the copyArray implementation
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array
])
  ArrayType::addToPrototype(copyArray)

/******************************************************************************/
// Main
/******************************************************************************/

function copy (...args) {

  let value = this !== undefined
    ? this
    : args.shift()

  const mutator = args.length > 0
    ? args.shift()
    : null

  value = copyWithImplementation(value)

  if (typeof mutator === 'function')
    mutator(value)

  return value
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default copy

export {
  copyObject
}
