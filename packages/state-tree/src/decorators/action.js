import { first } from '@benzed/array'

import StateTree from '../state-tree'

import { inspect } from 'util'

import {
  $$internal,
  validatePaths,
  ensureOwnInternal,
  isDecoratorSignature
} from '../util'

import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

const validateDecorator = (prototype, key, description) => {

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

}

const validateActionPath = (paths, key, prototype) => {

  try {
    paths = validatePaths(
      paths,
      prototype
    )
  } catch (err) {

    if (err.message.includes('is not a valid state key'))
      throw new Error(
        `action ${key.toString()} cannot scope itself to ` +
        `'${paths.map(key => key.toString())}'`
      )

    else
      throw err
  }

  if (paths.length > 1)
    throw new Error(`@action decorator can only take one path`)

  return first(paths)
}

/******************************************************************************/
// Main
/******************************************************************************/

function addActionName (prototype, key, description) {

  validateDecorator(prototype, key, description)

  const { actions } = ensureOwnInternal(prototype)

  const paths = this || [[]]
  const path = validateActionPath(paths, key, prototype)

  if (actions.some(action => action.key === key))
    throw new Error(`action ${inspect(key)} already registered`)

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

  const decorateWithpath = !isDecoratorSignature(args)
  const paths = decorateWithpath
    ? validatePaths(args)
    : null

  return decorateWithpath
    ? paths::addActionName
    : addActionName(...args)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default action
