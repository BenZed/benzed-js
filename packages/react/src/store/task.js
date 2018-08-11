import is from 'is-explicit'
import { equals, EQUALS } from '@benzed/immutable'

import Store from './store'

/******************************************************************************/
// Symbols
/******************************************************************************/

const TASK = Symbol('task-action')

/******************************************************************************/
// Helper
/******************************************************************************/

function actionEquals (bAction) {
  const aAction = this

  return is.func(bAction) &&
    TASK in bAction && equals(aAction.status, bAction.status)

}

/******************************************************************************/
// task
/******************************************************************************/

class Task {

  store = null
  action = null
  name = ''

  get = path => this.store.get(path)

  set = (path, value) => this.store.set(path, value)

  constructor (store, name, action) {

    this.store = store
    this.name = name

    this.action = this::action

    this.action[TASK] = this
    this.action[EQUALS] = actionEquals

    return this.action
  }

  status = value => {
    this.set([this.name, 'status'], value)
  }

}

/******************************************************************************/
// Decorator
/******************************************************************************/

function taskDecorator (prototype, name, descriptor) {

  if (!is(prototype, Store))
    throw new Error('@task decorator must be called on a subclass of Store')

  if (!is.func(descriptor.value))
    throw new Error('@task decorator must be called on a class method.')

  descriptor.value[TASK] = Task
  descriptor.enumerable = true

  return descriptor
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default taskDecorator

export {
  Task,
  TASK
}
