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

const copyObjectConsideringCircularRefs = (value, refs = [ value ]) => {

  const Type = value.constructor

  const clone = new Type()

  const keys = namesAndSymbols(value)
  for (const key of keys) {
    const keyValue = value[key]
    if (refs.includes(keyValue))
      continue

    const isObject = keyValue !== null && typeof keyValue === 'object'
    if (isObject)
      refs.push(keyValue)

    const implementsSameCopier = isObject && keyValue[$$copy] === copyObject
    clone[key] = implementsSameCopier
      ? copyObjectConsideringCircularRefs(keyValue, refs)
      : copyUsingImplementer(keyValue)

  }

  return clone
}

const copyUsingImplementer = value => value != null
  ? value[$$copy]()
  : value

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
  return this.map(copyUsingImplementer) // lol
}

function copyDate () {
  const Date = this.constructor
  return new Date(this.getTime())
}

function copyIterable () {
  const Type = this.constructor

  const args = []

  for (const value of this)
    args.push(value == null
      ? value
      : value[$$copy]()
    )

  return new Type(args)
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

Object::addToPrototype(copyObject)

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

  value = copyUsingImplementer(value)

  if (typeof mutator === 'function')
    mutator(value)

  return value
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default copy
