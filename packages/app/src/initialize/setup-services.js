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
      service(setupConfig, serviceName, app)
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupServices
