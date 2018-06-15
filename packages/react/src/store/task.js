import is from 'is-explicit'
import { milliseconds } from '@benzed/async'
import { equals, EQUALS } from '@benzed/immutable'

import Store from './store'

/******************************************************************************/
// Symbols
/******************************************************************************/

const TASK = Symbol('task-action')

/******************************************************************************/
// Data
/******************************************************************************/

const TaskStatus = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETE: 'complete'
}

const RESET_DELAY = 25

/******************************************************************************/
// Helper
/******************************************************************************/

function executeStatusEquals (other) {
  const execute = this

  return is.func(other) &&
    TASK in other &&
    execute.progress === other.progress &&
    execute.status === other.status &&
    equals(execute.error, other.error)

}

async function resolveTask (task, promise) {
  let result
  try {
    result = await promise
  } catch (err) {
    result = err
    task.error(err)
  }

  task.status(TaskStatus.COMPLETE)

  await milliseconds(RESET_DELAY)

  // so multiple calls don't conflict
  if (task.execute.status === TaskStatus.COMPLETE) {
    task.status(TaskStatus.IDLE)
    task.progress(0)
  }

  return result
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

    this.action = action

    this.execute[TASK] = this
    this.execute[EQUALS] = executeStatusEquals
    this.execute.progress = 0
    this.execute.status = TaskStatus.IDLE
    this.execute.error = null

    return this.execute
  }

  status (value = TaskStatus.IDLE) {
    this.set([this.name, 'status'], value)
  }

  progress (value = 0) {
    this.set([this.name, 'progress'], value)
  }

  error (value = null) {
    this.set([this.name, 'error'], value)
  }

  execute = (...args) => {
    // TODO throw error if task is running?

    this.status(TaskStatus.RUNNING)
    this.error(null)

    // get the promise outside of the resolveTask async function
    // so that if it throws an error, execute will throw as well
    const promise = this.action(...args)

    return resolveTask(this, promise)
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
