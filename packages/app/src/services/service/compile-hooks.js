import {
  PRIORITY,
  jwtAuth,
  softDelete,
  writeDateFields,
  castQueryIds
} from '../../hooks'

import { Schema, object, arrayOf, func, defaultTo } from '@benzed/schema'

import { Service as MemoryService } from 'feathers-memory'

/******************************************************************************/
// Symbol
/******************************************************************************/

const HOOKS = Symbol('hooks')

/******************************************************************************/
// Validation
/******************************************************************************/

const emptyObject = () => Object({})
const emptyArray = () => []

const methodArr = arrayOf(func, defaultTo(emptyArray))

const methodObj = object(

  defaultTo(emptyObject),
  {
    all: methodArr,
    get: methodArr,
    find: methodArr,
    create: methodArr,
    patch: methodArr,
    update: methodArr,
    remove: methodArr
  },

  'Must be an object with hook methods as keys.'
)

const validateHookTypeStructure = new Schema(
  object(
    true,
    'Must be an object with hook types as keys',

    defaultTo(emptyObject),
    {
      before: methodObj,
      after: methodObj,
      error: methodObj
    }
  )
)

const validateHookMethodStructure = new Schema(methodObj)

/******************************************************************************/
// Hook Compiler
/******************************************************************************/

// TODO if auth, soft-delete or write-date-fields are already in,
// the shortcuts should not be added
function addQuickHooks (app, config, adapter) {

  const service = this

  // Cast Query Ids
  if (adapter instanceof MemoryService)
    service.before({ all: castQueryIds(Number) })

  // Auth
  const authRequired = config.auth
  const authConfigured = app.get('auth')
  if (authConfigured && authRequired)
    service.before({ all: jwtAuth() })

  // SoftDelete
  const softDeleteOptions = config['soft-delete']
  if (softDeleteOptions)
    service.before({ all: softDelete(softDeleteOptions) })

  // writeDateFields
  const dateOptions = config.date
  if (dateOptions)
    service.after({ all: writeDateFields(dateOptions) })

}

function addServiceHooks (app, config) {

  const service = this

  let serviceHooks = service.addHooks(config, app)
  if (serviceHooks) {
    serviceHooks = validateHookTypeStructure(serviceHooks)
    mergeHooks(service[HOOKS], serviceHooks)
  }

}

function byPriority (a, b) {

  const ap = a[PRIORITY] || 0
  const bp = b[PRIORITY] || 0

  return ap > bp
    ? 1
    : ap < bp
      ? -1
      : 0
}

function mergeHooks (target, source) {

  const types = Object.keys(target)

  for (const type of types) {
    const targetMethods = target[type]
    const sourceMethods = source[type]
    if (!sourceMethods)
      continue

    for (const method in targetMethods)
      targetMethods[method] = [
        ...targetMethods[method],
        ...sourceMethods[method]
      ]
  }

}

function sortAndPruneHooks () {

  const service = this
  const hooks = service[HOOKS]
  const types = Object.keys(hooks)

  for (const type of types) {
    const methods = hooks[type]

    for (const method in methods) {
      const arr = methods[method]
      if (arr.length === 0)
        delete methods[method]
      else
        arr.sort(byPriority)
    }

    if (Object.keys(methods).length === 0)
      delete hooks[type]
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

function compileHooks (app, config, adapter) {

  const service = this

  service::addServiceHooks(app, config)
  service::addQuickHooks(app, config, adapter)
  service::sortAndPruneHooks()

  return service[HOOKS]
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default compileHooks

export {
  validateHookTypeStructure,
  validateHookMethodStructure,
  mergeHooks,
  HOOKS
}
