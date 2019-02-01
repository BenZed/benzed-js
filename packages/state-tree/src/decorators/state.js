import is from 'is-explicit'
import StateTree from '../state-tree'

import { copy, get } from '@benzed/immutable'

import { $$internal } from '../util'

/******************************************************************************/
// Helper
/******************************************************************************/

// TODO move me to util
const hasOwn = (Type, symbol) => {

  const basePrototype = Object.getPrototypeOf(Type.prototype)
  const BaseType = basePrototype.constructor

  const isReferenceEqual = BaseType[$$internal] === Type[$$internal]
  return !isReferenceEqual

}

/******************************************************************************/
// Main
/******************************************************************************/
//
const state = (prototype, key, description) => {

  // Validate
  const Type = prototype.constructor
  if (!is.subclassOf(Type, StateTree))
    throw new Error(
      `@state decorator can only decorate properties on classes extended ` +
      `from StateTree`)

  const value = 'initializer' in description
    ? description.initializer()
    : description.value
  if (is.func(value))
    throw new Error(
      `@state decorator can not decorate methods`
    )

  if (key in prototype)
    throw new Error(
      `@state decorator can not use '${key}' as a state key`
    )

  // base classes should not have their $$internal property mutated
  if (!hasOwn(Type, $$internal))
    Type[$$internal] = copy(Type[$$internal])

  const { stateInitial, stateKeys } = Type[$$internal]

  stateInitial[key] = copy(value)

  if (stateKeys.includes(key))
    throw new Error(`stateKey ${key.toString()} already registered.`)

  stateKeys.push(key)

  const path = [ $$internal, 'state', key ]

  return {
    configurable: false,
    enumerable: true,
    get () {
      return get.mut(this, path)
    }
  }
}

const stateSymbol = symbol =>
  (prototype, key, description) => state(prototype, symbol, description)

/******************************************************************************/
// Extends
/******************************************************************************/

state.symbol = stateSymbol

/******************************************************************************/
// Exports
/******************************************************************************/

export default state

export {
  hasOwn
}
