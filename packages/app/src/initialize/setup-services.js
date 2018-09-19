import { Service, FileService, UserService } from '../services'
import is from 'is-explicit'

/******************************************************************************/
// Data
/******************************************************************************/

const FILE_SERVICE_NAME = 'files'

const SERVICE_METHODS = [ 'find', 'get', 'create', 'remove', 'patch', 'update', 'setup' ]

/******************************************************************************/
// Helpers
/******************************************************************************/

function assertServicesMissingConfig (config, services) {

  const configKeys = config ? Object.keys(config) : []

  for (const serviceName in services)
    if (!configKeys.includes(serviceName))
      throw new Error(`App is missing configuration for '${serviceName}' service.`)

}

function isGenericFeatherService (instance) {
  return !is.subclassOf(instance, Service) &&
    is.object(instance) &&
    SERVICE_METHODS.some(name => is.func(instance[name]))
}

function addServiceShortCut (name) {

  const app = this

  if (name in app)
    return

  const getter = {
    get () {
      return this.feathers.service(name)
    },
    configurable: false,
    enumerable: true
  }

  Object.defineProperty(app, name, getter)
}

/******************************************************************************/
// Main
/******************************************************************************/

function setupServices () {

  const app = this
  const { feathers } = app

  const authConfig = feathers.get('auth')
  const serviceConfig = feathers.get('services')

  const services = app.services || {}

  assertServicesMissingConfig(serviceConfig, services)

  for (const serviceName in serviceConfig) {

    const setupConfig = serviceConfig[serviceName]
    if (!setupConfig || serviceConfig.enabled === false)
      continue

    let service = app.services && app.services[serviceName]
    if (!service && authConfig && serviceName === authConfig.service)
      service = UserService

    if (!service && serviceName === FILE_SERVICE_NAME)
      service = FileService

    if (!service)
      service = Service

    if (service instanceof Function === false)
      throw new Error('service must be a function or a Service instance')

    if (is.instanceable(service)) {
      const Service = service
      const instance = new Service(setupConfig, serviceName, app)
      if (isGenericFeatherService(instance))
        feathers.use(serviceName, instance)

    } else
      // TODO ensure that a service named serviceName is setup
      service(setupConfig, serviceName, app)
  }

  // give services name property and create app shortcut
  for (const name in feathers.services) {
    feathers.services[name].name = name
    app::addServiceShortCut(name)
  }

  // run service initializers
  const initPromises = []
  for (const name in feathers.services) {
    const service = feathers.services[name]
    const hasInitFunc = is.func(service.initialize)
    const result = hasInitFunc &&
      service.initialize(
        app.get(['services', name]),
        app
      )

    if (is(result, Promise))
      initPromises.push(result)
  }

  return Promise.all(initPromises)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupServices
