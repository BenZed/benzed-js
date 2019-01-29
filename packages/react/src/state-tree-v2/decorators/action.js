import { first, wrap } from '@benzed/array'

import is from 'is-explicit'
import StateTree from '../state-tree'
import { $$tree } from '../symbols'

import applyState from '../apply-state'
import { isArrayOfPaths, normalizePaths } from '../path-util'

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

  if (path.length > 0 && !Type[$$tree].state.keys.includes(first(path)))
    throw new Error(
      `action ${key} cannot scope itself to '${path}', ` +
      `'${first(path)}' is an invalid state key.`
    )

  return isPropertyInitializer
}

/******************************************************************************/
// Main
/******************************************************************************/

function createAction (prototype, key, description) {

  const path = wrap(this)

  const isPropertyInitializer = validateDecorator(prototype, key, description, path)

  const { value, initializer } = description

  return {
    writable: false,
    enumerable: true,
    initializer () {

      let method

      const action = function (...args) {

        const tree = this

        // HACK this has to be done here, because for reasons I don't understand
        // this (this) scope in the above initializer() function gets set to
        // the description object rather than the class instance, desipte the fact
        // that logging (this) results in the class instance
        if (!method)
          method = isPropertyInitializer
            ? tree::initializer()
            : tree::value

        const result = method(...args)
        return is(result, Promise)
          ? result.then(resolved => applyState(tree, path, resolved, action.name))
          : applyState(tree, path, result, action.name)

      }

      return Object.defineProperty(action, 'name', { value: key })

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
    ? path::createAction(...args)
    : path::createAction

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default action
