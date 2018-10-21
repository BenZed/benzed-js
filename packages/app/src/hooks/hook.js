
// eslint-disable-next-line
import { createValidator } from '@benzed/schema'

import is from 'is-explicit'

// @jsx createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const HOOK_METHODS = [ 'all', 'find', 'get', 'update', 'patch', 'create', 'remove' ]

const HOOK_TYPES = [ 'before', 'after', 'error' ]

const PRIORITY = Symbol('hook-priority')

/******************************************************************************/
// Validation
/******************************************************************************/

const HookConfig = <object plain strict required >

  <string key='name' default={ctx => ctx.value?.exec?.name || 'hook' }/>
  <number key='priority' default={0}/>

  <arrayOf key='methods' default={HOOK_METHODS} cast>
    <oneOf>{HOOK_METHODS}</oneOf>
  </arrayOf>

  <arrayOf key='types' default={HOOK_TYPES} cast>
    <oneOf>{HOOK_TYPES}</oneOf>
  </arrayOf>

  <func key='exec' required />
  <func key='setup' />

</object>

/******************************************************************************/
// Helper
/******************************************************************************/

function getAllMethods (object) {

  const methods = {}

  while (object !== Object.prototype) {
    const names = Object.getOwnPropertyNames(object)
    for (const name of names)
      if (name !== 'constructor' && is.func(object[name]))
        methods[name] = object[name]

    object = Object.getPrototypeOf(object)
  }

  return methods

}

function createInstancer ({ priority, setup, exec, ...rest }) {

  const methods = getAllMethods(this)

  const instancer = (...args) => {

    const instance = {
      ...rest,
      ...methods
    }

    if (setup)
      instance.options = setup(...args)

    const hook = instance::exec

    return hook
      ::define(PRIORITY, priority)
      ::define('name', rest.name)

  }

  return instancer
    ::define('name', `setup-${rest.name}`)

}

function define (key, value) {
  const obj = this

  Object.defineProperty(obj, key, { value, enumerable: !is.symbol(key) })

  return obj
}

/******************************************************************************/
// Main
/******************************************************************************/

class Hook {

  constructor (input) {

    const config = HookConfig(input)

    const instancer = this::createInstancer(config)

    return config.setup
      ? instancer
      : instancer()
  }

  checkContext (ctx) {

    const { method, data, id, type } = ctx

    if (!this.types.includes(type))
      throw new Error(`The '${this.name}' hook can only be used as a '${this.types}' hook.`)

    if (!this.methods.includes(method))
      throw new Error(`The '${this.name}' hook can only be used on the '${this.methods}' service methods.`)

    const isFind = method === 'find'
    const isGet = method === 'get'

    const isUpdate = method === 'update'
    const isPatch = method === 'patch'

    const isRemove = method === 'remove'
    const isCreate = method === 'create'

    const isView = isFind || isGet

    const isBulkCreate = !isView && isCreate && is(data, Array)
    const isBulkEditOrDelete = !isView && !isCreate && !is.defined(id)

    const isBefore = type === 'before'
    const isAfter = type === 'after'
    const isError = type === 'error'

    return {

      isUpdate,
      isPatch,
      isFind,
      isGet,

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
