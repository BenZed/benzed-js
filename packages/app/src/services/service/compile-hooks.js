import { PRIORITY, jwtAuth, softDelete } from '../../hooks'

import { Schema, object, arrayOf, func, defaultTo } from '@benzed/schema'

/******************************************************************************/
// Symbol
/******************************************************************************/

const HOOKS = Symbol('hooks')

/******************************************************************************/
// Validation
/******************************************************************************/

const emptyObject = () => Object({})

const methodArr = arrayOf(func, defaultTo(() => []))

const methodObj = object(
  true,

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

function addQuickHooks (app, config) {

  const service = this

  const all = []
  // Auth
  const auth = app.get('auth')
  if (auth && config.auth)
    all.push(jwtAuth())

  // SoftDelete
  const softDeleteOptions = config.softDelete
  if (softDeleteOptions)
    all.push(softDelete(softDeleteOptions))

  service.before({ all })

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

function compileHooks (app, config) {

  const service = this

  service::addQuickHooks(app, config)
  service::addServiceHooks(app, config)
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
