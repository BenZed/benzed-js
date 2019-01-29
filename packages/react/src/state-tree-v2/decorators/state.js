import is from 'is-explicit'
import StateTree from '../state-tree'

import { copy, get } from '@benzed/immutable'
import { $$tree, $$state } from '../symbols'

/******************************************************************************/
// Helper
/******************************************************************************/

// TODO move me to util
const hasOwn = (Type, symbol) => {

  const basePrototype = Object.getPrototypeOf(Type.prototype)
  const BaseType = basePrototype.constructor

  const isReferenceEqual = BaseType[$$tree] === Type[$$tree]
  return !isReferenceEqual

}

/******************************************************************************/
// Main
/******************************************************************************/

const state = (prototype, key, description) => {

  // Validate

  const Type = prototype.constructor
  if (!is.subclassOf(Type, StateTree))
    throw new Error(
      `@state decorator can only decorate properties on classes extended ` +
      `from StateTree`)

  const value = description.initializer()
  if (is.func(value))
    throw new Error(
      `@state decorator can not decorate methods`
    )

  if (key in prototype)
    throw new Error(
      `@state decorator can not use '${key}' as a state key`
    )

  // base classes should not have their $$tree property mutated
  if (!hasOwn(Type, $$tree))
    Type[$$tree] = copy(Type[$$tree])

  const { state } = Type[$$tree]

  state.initial[key] = copy(value)

  // if the key already exists in the state definition, we must be changing
  // the state keys on an extended class
  if (!state.keys.includes(key)) {
    state.keys.push(key)

    const path = [ $$state, 'state', key ]

    return {
      configurable: false,
      enumerable: true,
      get () {
        return get.mut(this, path)
      }
    }
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default state

export {
  hasOwn
}
