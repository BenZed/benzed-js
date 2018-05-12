import { Service, FileService, UserService } from '../services'

/******************************************************************************/
// Data
/******************************************************************************/

const FILE_SERVICE_NAME = 'files'

/******************************************************************************/
// Helpers
/******************************************************************************/

function assertServicesMissingConfig (config, services) {

  const configKeys = config ? Object.keys(config) : []

  for (const serviceName in services)
    if (!configKeys.includes(serviceName))
      throw new Error(`App is missing configuration for '${serviceName}' service.`)

}

function isServiceConstructor (input) {

  const { prototype } = input

  return prototype.constructor === Service ||
    prototype instanceof Service
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
    if (!setupConfig || ('enabled' in serviceConfig && !serviceConfig.enabled))
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

    if (isServiceConstructor(service))
      void new Service(setupConfig, serviceName, app)

    else
      app::service(setupConfig, serviceName, app)

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupServices
