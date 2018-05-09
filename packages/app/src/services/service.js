import { copy } from '@benzed/immutable'
import { Schema,
  object,
  string,
  bool,
  oneOfType,
  arrayOf,
  func,

  defaultTo
} from '@benzed/schema'

/******************************************************************************/
// DATA
/******************************************************************************/

const HOOK_TYPES = {
  all: [],
  get: [],
  find: [],
  create: [],
  patch: [],
  update: [],
  remove: []
}

/******************************************************************************/
// Validation
/******************************************************************************/

const boolToObject = value => value === true ? {} : value === false ? null : value

const configObject = object({
  cast: boolToObject
})

const validateConfig = new Schema({
  shape: {
    path: string,
    auth: bool(defaultTo(true)),
    softDelete: configObject,
    versions: configObject,
    liveEdit: configObject
  }
})

const validateFunctionality = new Schema({
  shape: {
    hooks: oneOfType(func, object),
    permissions: func,
    schema: func,
    middleware: arrayOf(func)
  }
})

/******************************************************************************/
// Helper
/******************************************************************************/

function addServiceShortCut (name) {
  const app = this

  const { defineProperty } = Object

  const getter = {
    get () {
      return this.feathers.service(name)
    },
    configurable: false
  }

  defineProperty(app, name, getter)
}

function buildHooks (softDelete, requiresAuth) {

  const before = HOOK_TYPES::copy()
  const after = HOOK_TYPES::copy()

  const feathers = this
  const auth = feathers.get('auth')

  if (auth && requiresAuth) {
    const jwt = require('@feathersjs/authentication')
      .hooks
      .authenticate('jwt')

    before.all.push(jwt)
  }

  if (softDelete)
    before.all.push(dummyHook('soft-delete', softDelete))

  return { before, after }

}

function getDatabaseAdapter (name, paginate) {

  const app = this

  if (app.database && app.database.link) {

    const { Service: MongoService } = require('feathers-mongodb')

    const Model = app.database.link.collection(name)
    return new MongoService({
      Model,
      paginate
    })

  } else {

    const MemoryService = require('feathers-mongodb')

    return new MemoryService({
      id: '_id',
      paginate
    })
  }

}

/******************************************************************************/
// TEMP
/******************************************************************************/

function dummyHook (name) {
  return () => console.log(name, 'hook not yet implemented')
}

function setupLiveEdit (config) {
  console.log('set up live edit', config)
}

function setupVersions (config) {
  console.log('set up live edit', config)
}

/******************************************************************************/
// Main
/******************************************************************************/

function Service (functionality) {

  functionality = validateFunctionality(functionality) || {}

  return function (config, name) {

    const {
      path = name,
      softDelete,
      liveEdit,
      versions,
      paginate,
      auth
    } = validateConfig(config, name)

    const app = this
    const { feathers } = app

    if (path in app === false)
      app::addServiceShortCut(path)

    const adapter = app::getDatabaseAdapter(name, paginate)

    const service = feathers
      .use(`/${path}`, adapter)
      .service(path)

    const baseHooks = feathers::buildHooks(softDelete, auth)
    service.hooks(baseHooks)

    let customHooks = functionality.hooks
    if (customHooks instanceof Function)
      customHooks = app::customHooks(config)

    // TODO add
    // if (functionality.permissions)
    //   app::setupPermissions(functionality.permissions)

    // if (functionality.permissions)
    //   app::setupSchema(functionality.schema)

    if (customHooks)
      service.hooks(customHooks)

    if (versions)
      service::setupVersions(versions)

    if (liveEdit)
      service::setupLiveEdit(liveEdit)

    return service

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Service

export { validateFunctionality }
