import is from 'is-explicit'
import StateTree from '../state-tree'

import {
  $$internal,
  isArrayOfPaths,
  normalizePaths
} from '../util'

import { copy } from '@benzed/immutable'

import { hasOwn } from './state'

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

  // base classes should not have their $$internal property mutated
  if (!hasOwn(Type, $$internal))
    Type[$$internal] = copy(Type[$$internal])

  const { memoizers } = Type[$$internal]

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

  const decoratedWithoutPath = args.length === 3 && !isArrayOfPaths(args)
  const paths = decoratedWithoutPath
    ? [[]]
    : normalizePaths(args)

  return decoratedWithoutPath
    ? paths::createMemoizedGetter(...args)
    : paths::createMemoizedGetter

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default memoize
