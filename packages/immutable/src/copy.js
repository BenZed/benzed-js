import { $$copy } from './symbols'
import { namesAndSymbols } from './equals'

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

const hasNoPrototype = object => {
  const prototype = Object.getPrototypeOf(object)
  return prototype === null
}

const resolveCircularReference = (value, refs) => {

  const isObject = value !== null && typeof keyValue === 'object'
  const hasCircularReference = isObject && refs.has(value)

  const clone = hasCircularReference
    ? refs.get(value)
    : copyWithImplementation(value, refs)

  if (isObject && !hasCircularReference)
    refs.set(value, clone)

  return clone
}

const copyArrayConsideringCircularRefs = (value, refs) => {

  const clone = new value.constructor(value.length)

  if (refs instanceof WeakMap === false)
    refs = new WeakMap([ [ value, clone ] ])

  for (let i = 0; i < value.length; i++)
    clone[i] = resolveCircularReference(value[i], refs)

  return clone
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

  if (refs instanceof WeakMap === false)
    refs = new WeakMap([ [ value, clone ] ])

  const keys = namesAndSymbols(value)
  for (const key of keys)
    clone[key] = resolveCircularReference(value[key], refs)

  return clone
}

const copyWithImplementation = (value, refs) => {

  if (refs instanceof WeakMap && refs.has(value))
    return refs.get(value)

  if (value == null)
    return value

  if (typeof value[$$copy] === 'function')
    return value[$$copy](refs)

  if (hasNoPrototype(value))
    return copyObjectConsideringCircularRefs(value, refs)

  throw new Error(
    `${value.constructor?.name || 'value'} does not ` +
    `implement $$copy trait.`
  )

}

/******************************************************************************/
// Implementations
/******************************************************************************/

function returnSelf () {
  return this
}

function copyObject (refs) {
  return copyObjectConsideringCircularRefs(this, refs)
}

function copyArray (refs) {
  return copyArrayConsideringCircularRefs(this, refs)
}

function copyDate () {
  const Date = this.constructor

  return new Date(this.getTime())
}

function copyIterable (refs) {
  const Type = this.constructor

  const args = []

  for (const value of this)
    args.push(copyWithImplementation(value, refs))

  return new Type(args)
}

function copyBuffer () {
  return Buffer.from([ ...this ])
}

/******************************************************************************/
// Apply Implementations
/******************************************************************************/

for (const Primitive of [ String, Number, Boolean ])
  Primitive::addToPrototype(returnSelf)

for (const Immutable of [ RegExp, Symbol, Function ])
  Immutable::addToPrototype(returnSelf)

for (const WeakCollection of [ WeakSet, WeakMap ])
  WeakCollection::addToPrototype(returnSelf)

for (const Iterable of [ Set, Map ])
  Iterable::addToPrototype(copyIterable)

// On second thought, we don't want custom types to inherit $$copy functionality
// unless we explicitly ask them to.
Object::addToPrototype(copyObject)

Date::addToPrototype(copyDate)

if (typeof Buffer !== 'undefined')
  Buffer::addToPrototype(copyBuffer) // eslint-disable-line node/no-deprecated-api

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

function copy (value, refs) {

  if (this !== undefined) {
    refs = value
    value = this
  }

  if (!copy._warn)
    copy._warn = !console.warn(
      'TO BEN: Do not publish @benzed/immutable 3.0 yet.\n\n' +
      '- default implementations for custom objects needs to be sorted\n'
    )

  return copyWithImplementation(value, refs)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default copy

export {
  copyObject
}
