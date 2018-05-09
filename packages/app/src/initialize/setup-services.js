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

    const setupFunc = app.services && app.services[serviceName]
      ? app.services[serviceName]
      : authConfig && serviceName === authConfig.service
        ? UserService()
        : serviceName === FILE_SERVICE_NAME
          ? FileService()
          : Service()

    app::setupFunc(setupConfig, serviceName)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupServices
