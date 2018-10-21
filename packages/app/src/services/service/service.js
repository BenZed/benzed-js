import is from 'is-explicit'

import App from '../../app'

import { createValidator } from '@benzed/schema' // eslint-disable-line no-unused-vars

import getDatabaseAdapter from './get-database-adapter'
import registerToFeathers from './register-to-feathers'
import compileHooks, {
  validateHookMethodStructure,
  validateHookTypeStructure,
  mergeHooks,
  HOOKS
} from './compile-hooks'

import { boolToObject } from '../../util'

// @jsx createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validation
/******************************************************************************/

const removeFirstSlash = value =>
  is.string(value)
    ? value.replace(/^\/+/, '')
    : value

const validateConfig = <object plain>
  <string key='path' default={ctx => ctx.data.name} validate={removeFirstSlash}/>
  <bool key='auth' default={!!true} />
  <object key='soft-delete' cast={boolToObject} />
  <object key='versions' cast={boolToObject} />
  <object key='live-edit' cast={boolToObject} />
</object>

const validateName = <string required />

const validateApp = <object validate={app =>
  is(app, App)
    ? app
    : throw new Error('must be an App instance.')}
/>

/******************************************************************************/
// Main
/******************************************************************************/

class Service {

  constructor (config, name, app) {

    const {
      path,
      paginate // ,
      // versions,
      // 'live-edit': liveEdit,
    } = config = validateConfig(config, { data: { name } })
    name = validateName(name)
    app = validateApp(app)

    // overwrite old config
    app.set(['services', name], config)

    const adapter = this::getDatabaseAdapter(app, name, paginate)
    const service = this::registerToFeathers(app, path, adapter, config)
    const hooks = this::compileHooks(app, config, adapter)

    service.hooks(hooks)

    service.Service = this.constructor

    // if (versions)
    //   service::setupVersions(versions)

    // if (liveEdit)
    //   service::setupLiveEdit(liveEdit)

    if (is.func(this.initialize))
      service.initialize = this.initialize

    if (is.func(this.start))
      service.start = this.start

    if (is.func(this.setupSocketMiddleware))
      service.setupSocketMiddleware = this.setupSocketMiddleware

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
