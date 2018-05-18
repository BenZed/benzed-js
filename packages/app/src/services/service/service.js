import is from 'is-explicit'

import App from '../../app'

import { Schema, object, string, bool, required, defaultTo } from '@benzed/schema'
import getDatabaseAdapter from './get-database-adapter'
import registerToFeathers from './register-to-feathers'
import compileHooks, {
  validateHookMethodStructure,
  validateHookTypeStructure,
  mergeHooks,
  HOOKS
} from './compile-hooks'

/******************************************************************************/
// Validation
/******************************************************************************/

const boolToObject = value =>
  value === true
    ? {}
    : value === false
      ? null
      : value

const configObject = object({
  cast: boolToObject
})

const defaultToName = (value, { args }) =>
  is.string(value)
    ? value
    : args[0]

const removeFirstSlash = value => {
  if (!is.string(value))
    return value

  value = value.replace(/^\/+/, '')

  return value
}

const validateConfig = new Schema({
  path: string(defaultToName, removeFirstSlash),
  auth: bool(defaultTo(true)),
  'soft-delete': configObject,
  versions: configObject,
  'live-edit': configObject
}, false)

const validateName = new Schema(
  string(required('Name is required.'))
)

const validateApp = value => {
  if (!value || (value instanceof App === false))
    throw new Error('Must be an App instance.')

  return value
}

/******************************************************************************/
// Helper
/******************************************************************************/

function addServiceShortCut (name) {

  const app = this

  if (name in app)
    return

  const getter = {
    get () {
      return this.feathers.service(name)
    },
    configurable: false
  }

  Object.defineProperty(app, name, getter)
}

/******************************************************************************/
// Main
/******************************************************************************/

class Service {

  constructor (config, name, app) {

    const {
      path,
      // versions,
      // 'live-edit': liveEdit,
      paginate
    } = config = validateConfig(config, name)
    name = validateName(name)
    app = validateApp(app)

    app::addServiceShortCut(path)

    const adapter = this::getDatabaseAdapter(app, name, paginate)
    const service = this::registerToFeathers(app, path, adapter, config)
    const hooks = this::compileHooks(app, config)

    service.hooks(hooks)

    // if (versions)
    //   service::setupVersions(versions)

    // if (liveEdit)
    //   service::setupLiveEdit(liveEdit)

    return service

  }

  [HOOKS] = validateHookTypeStructure({})

  before (hooksToAdd) {
    mergeHooks(this[HOOKS], {
      before: validateHookMethodStructure(hooksToAdd)
    })
  }

  after (hooksToAdd) {
    mergeHooks(this[HOOKS], {
      after: validateHookMethodStructure(hooksToAdd)
    })
  }

  error (hooksToAdd) {
    mergeHooks(this[HOOKS], {
      error: validateHookMethodStructure(hooksToAdd)
    })
  }

  // Life Cycle
  addMiddleware (config, app) {}

  addHooks (config, app) {}

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Service
