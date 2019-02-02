import is from 'is-explicit'
import StateTree from '../state-tree'

import {

  $$internal,
  isDecoratorSignature,
  validatePaths,
  ensureOwnInternal

} from '../util'

/******************************************************************************/
// Main
/******************************************************************************/

function createMemoizedGetter (prototype, key, description) {

  const paths = this

  // Validate

  const Type = prototype.constructor
  if (!is.subclassOf(Type, StateTree))
    throw new Error(
      `@memoize decorator can only decorate getters on classes extended ` +
      `from StateTree`)

  const { get } = description
  if (!is.func(get))
    throw new Error(
      `@memoize decorator can only decorate getters`
    )

  const { memoizers } = ensureOwnInternal(prototype)

  memoizers.push({ paths, get, key })

  return {
    enumerable: true,
    configurable: false,
    get () {
      const tree = this
      return tree[$$internal].memoized[key]
    }
  }

}

/******************************************************************************/
// Decorator with optional call signatures: @action() or @action
/******************************************************************************/

const memoize = (...args) => {

  const decoratedWithoutPath = isDecoratorSignature(args)
  const paths = decoratedWithoutPath
    ? [[]]
    : validatePaths(args)

  return decoratedWithoutPath
    ? paths::createMemoizedGetter(...args)
    : paths::createMemoizedGetter

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default memoize
