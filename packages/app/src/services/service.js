import is from 'is-explicit'
import { MongoService } from 'feathers-mongodb'
import { copy } from '@benzed/immutable'

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
// TEMP
/******************************************************************************/

function dummyHook (name) {
  return () => console.log(name, 'hook not yet implemented')
}

function setupLiveEdit () {
  console.log('set up live edit')
}

function setupVersions () {
  console.log('set up live edit')
}

/******************************************************************************/
// Helper
/******************************************************************************/

function validateConfig (config) {

  if (is(config, String))
    config = { name: config }

  if (!is.plainObject(config))
    throw new Error('Config must be a string or a plain object.')

  // TODO
  // check for versions config
  // check for liveedit config
  // check for softdelete config
  // check for requiresAuth flag

  return config
}

function addServiceShortCut (name) {
  const app = this

  const { defineProperty } = Object

  const getter = {
    get () {
      return this.feathrs.service(name)
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
    const jwt = require('@feathers/authentication')
      .hooks
      .authenticate('jwt')

    before.all.push(jwt)
  }

  if (softDelete)
    before.all.push(dummyHook('soft-delete', softDelete))

  return { before, after }

}

/******************************************************************************/
// Main
/******************************************************************************/

function Service (config) {

  const {
    name, versions, liveEdit, softDelete, requiresAuth
  } = validateConfig(config)

  return function (feathers) {

    const app = this
    if (app !== undefined && name in app === false)
      app::addServiceShortCut(name)

    const Model = feathers.db.collection(name)

    const service = feathers
      .use(`/${name}`, new MongoService({ Model }))
      .service(name)

    const hooks = feathers::buildHooks(softDelete, requiresAuth)
    service.hooks(hooks)

    if (versions)
      service::setupVersions()

    if (liveEdit)
      service::setupLiveEdit()

    return service
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Service
