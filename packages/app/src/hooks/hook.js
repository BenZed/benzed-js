import {

  Schema,
  number,
  arrayOf,
  func,
  oneOf,
  object,
  string,

  defaultTo,
  required

} from '@benzed/schema'

import is from 'is-explicit'

/******************************************************************************/
// Data
/******************************************************************************/

const HOOK_METHODS = Object.freeze([ 'all', 'find', 'get', 'update', 'patch', 'create', 'remove' ])

const HOOK_TYPES = Object.freeze([ 'before', 'after', 'error' ])

const PRIORITY = Symbol('hook-priority')

/******************************************************************************/
// Validation
/******************************************************************************/

const validateConfig = new Schema(object(
  required,
  {
    name: string(defaultTo(ctx => ctx.data.exec.name || 'hook')),
    priority: number(defaultTo(0)),
    methods: arrayOf(oneOf(HOOK_METHODS), defaultTo(HOOK_METHODS)),
    types: arrayOf(oneOf(HOOK_TYPES), defaultTo(HOOK_TYPES)),
    exec: func(required),
    setup: func()
  })
)

/******************************************************************************/
// Helper
/******************************************************************************/

function setupHook (...args) {
  const [ base, hook, setup ] = this

  base.options = setup(...args)

  return hook

}

function define (key, value) {
  const obj = this

  Object.defineProperty(obj, key, { value, enumerable: is.symbol(key) })

  return obj
}

/******************************************************************************/
// Main
/******************************************************************************/

class Hook {

  constructor (config) {

    const { name, priority, methods, types, exec, setup } = validateConfig(config)

    this.methods = methods
    this.types = types
    this.name = name
    this.options = {}

    const hook = this::exec

    hook
      ::define('name', name)
      ::define(PRIORITY, priority)

    return setup
      ? [this, hook, setup]
        ::setupHook
        ::define('name', `setup-${name}`)

      : hook
  }

  checkContext (ctx) {

    const { method, data, id, type } = ctx

    if (!this.types.includes(type))
      throw new Error(`The '${this.name}' hook can only be used as a '${this.types}' hook.`)

    if (!this.methods.includes(method))
      throw new Error(`The '${this.name}' hook can only be used on the '${this.methods}' service methods.`)

    const isFind = method === 'find'
    const isGet = method === 'get'
    const isView = isFind || isGet

    const isUpdate = method === 'update'
    const isPatch = method === 'patch'
    const isEdit = isUpdate || isPatch

    const isRemove = method === 'remove'
    const isCreate = method === 'create'

    const isBulkCreate = !isView && isCreate && is(data, Array)
    const isBulkEditOrDelete = !isView && !isCreate && !is.defined(id)

    const isBefore = type === 'before'
    const isAfter = type === 'after'
    const isError = type === 'error'

    return {

      isView,
      isFind,
      isGet,
      isEdit,

      isRemove,
      isCreate,

      isBefore,
      isAfter,
      isError,

      isBulk: isBulkCreate || isBulkEditOrDelete
    }
  }
}

function prepareGeneric (name, priority) {

  const hook = this

  return hook
    ::define('name', name)
    ::define(PRIORITY, priority)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Hook

export { PRIORITY, prepareGeneric }
