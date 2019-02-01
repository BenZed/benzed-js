import { first, wrap } from '@benzed/array'
import { copy } from '@benzed/immutable'

import StateTree from '../state-tree'

import {
  $$internal,
  isArrayOfPaths,
  normalizePaths
} from '../util'

import { hasOwn } from './state'

import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

const validateDecorator = (prototype, key, description, path) => {

  const Type = prototype.constructor
  if (!is.subclassOf(Type, StateTree))
    throw new Error(
      `@action decorator can only decorate methods on classes extended ` +
      `from StateTree`)

  const isPropertyInitializer = is.func(description.initializer)
  if (!is.func(isPropertyInitializer
    ? description.initializer()
    : description.value))
    throw new Error(
      `@action decorator can only decorate methods`
    )

  if (path.length > 0 && !Type[$$internal].stateKeys.includes(first(path)))
    throw new Error(
      `action ${key.toString()} cannot scope itself to ` +
      `'${path.map(key => key.toString())}', ` +
      `'${first(path).toString()}' is an invalid state key.`
    )

}

/******************************************************************************/
// Main
/******************************************************************************/

function addActionName (prototype, key, description) {

  const path = wrap(this)

  validateDecorator(prototype, key, description, path)

  const Type = prototype.constructor

  // base classes should not have their $$internal property mutated
  if (!hasOwn(Type, $$internal))
    Type[$$internal] = copy(Type[$$internal])

  const { actions } = Type[$$internal]

  if (actions.some(action => action.key === key))
    throw new Error(`action ${key} already registered`)

  actions.push({
    key,
    func: description.value || description.initializer,
    call: !!description.initializer,
    path
  })

  return {
    enumerable: true,
    configurable: false,
    get () {
      return this[$$internal].actions[key]
    }
  }

}

/******************************************************************************/
// Decorator with optional call signatures: @action() or @action
/******************************************************************************/

const action = (...args) => {

  const decoratedWithoutPath = args.length === 3 && !isArrayOfPaths(args)
  const paths = decoratedWithoutPath
    ? [[]]
    : normalizePaths(args)

  if (paths.length > 1)
    throw new Error(`@action decorator can only take one path`)

  const path = first(paths)

  return decoratedWithoutPath
    ? path::addActionName(...args)
    : path::addActionName

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default action
