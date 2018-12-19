import { $$equals } from './symbols'
import { isArrayLike } from '@benzed/array'

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperty, getOwnPropertyNames, getOwnPropertySymbols } = Object

function addToPrototype (copier) {

  const Type = this

  defineProperty(Type.prototype, $$equals, {
    value: copier,
    writable: true
  })

}

const namesAndSymbols = value => {

  const names = getOwnPropertyNames(value)
  const symbols = getOwnPropertySymbols(value)

  return names.concat(symbols)
}

const compareUsingImplementers = (left, right) => {

  if (left == null || right == null || left === right)
    return left === right

  if (left[$$equals](right))
    return true

  // if the right hand side uses a different implementation
  return right[$$equals] !== left[$$equals]
    ? right[$$equals](left)
    : false

}

const arrayLikesAreEqual = (left, right) => {

  if (left.length !== right.length)
    return false

  for (let i = 0; i < left.length; i++)
    if (!compareUsingImplementers(left[i], right[i]))
      return false

  return true
}

/******************************************************************************/
// Implementations
/******************************************************************************/

function identical (right) {
  const left = this
  return left === right
}

function identicalOrBothNaN (right) {
  const left = this
  return left === right || (Number.isNaN(left) && Number.isNaN(right))
}

function equalIterable (right) {
  const left = this

  if (right === null || typeof right !== 'object' || !right[Symbol.iterator])
    return false

  return arrayLikesAreEqual(
    [ ...left ],
    [ ...right ]
  )
}

function equalArray (right) {
  const left = this

  if (!isArrayLike(right))
    return false

  return arrayLikesAreEqual(left, right)
}

function equalObject (right) {

  if (typeof right !== 'object' || right === null)
    return false

  const left = this

  const akeys = namesAndSymbols(left)
  const bkeys = namesAndSymbols(right)

  if (akeys.length !== bkeys.length)
    return false

  for (const key of akeys)
    if (!compareUsingImplementers(left[key], right[key]))
      return false

  return true

}

function equalDate (right) {
  const left = this

  return right !== null &&
    typeof right === 'object' &&
    typeof right.getTime === 'function' &&
    left.getTime() === right.getTime()
}

function equalRegexp (right) {
  const left = this

  return right !== null &&
    right instanceof RegExp &&
    String(left) === String(right)
}

/******************************************************************************/
// Apply Implementations
/******************************************************************************/

for (const Primitive of [ String, Boolean ])
  Primitive::addToPrototype(identical)

for (const Immutable of [ Symbol, Function ])
  Immutable::addToPrototype(identical)

for (const Iterable of [ Map, Set ])
  Iterable::addToPrototype(equalIterable)

Number::addToPrototype(identicalOrBothNaN)
Object::addToPrototype(equalObject)
RegExp::addToPrototype(equalRegexp)
Array::addToPrototype(equalArray)
Date::addToPrototype(equalDate)

// fun fact: equalObject would work on all of these, but the equalArray
// implementation is faster
for (const ArrayType of [
  Array,
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
  ArrayType::addToPrototype(equalArray)

/******************************************************************************/
// Main
/******************************************************************************/

function equals (...args) {

  const left = this !== undefined && args.length < 2
    ? this
    : args.shift()

  const right = args.shift()

  return compareUsingImplementers(left, right)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default equals

export { namesAndSymbols }
