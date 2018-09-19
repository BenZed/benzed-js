import { isEnabled } from '../configure'
import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

function defaultSetupChannels () {

  const app = this
  const { feathers } = app

  const auth = feathers.get('auth')
  const authEnabled = isEnabled(auth)

  // Join anonymous channel on connect
  feathers.on('connection', connection => {
    feathers
      .channel('anonymous')
      .join(connection)
  })

  // Join authenticated channel on login
  if (authEnabled)
    feathers.on('login', (payload, { connection }) => {
      // in case a client is using rest
      if (!connection)
        return

      feathers
        .channel('anonymous')
        .leave(connection)

      feathers
        .channel('authenticated')
        .join(connection)
    })
}

function defaultPublishChannels (data, context) {

  const app = this
  const { service } = context
  const { name } = service
  const { feathers } = app

  const { auth: serviceAuth } = app.get(['services', name])
  const appAuth = isEnabled(app.get('auth'))

  const channels = [
    appAuth && 'authenticated',
    (!appAuth || !serviceAuth) && 'anonymous'
  ].filter(is.string)

  return feathers.channel(...channels)
}

/******************************************************************************/
// Main
/******************************************************************************/

function setupChannels () {

  const app = this
  const { feathers } = app

  const socketio = feathers.get('socketio')
  if (!isEnabled(socketio))
    return

  if (is.func(app.setupChannels))
    app.setupChannels()
  else
    app::defaultSetupChannels()

  if (is.func(app.publishChannels))
    feathers.publish(::app.publishChannels)
  else
    feathers.publish(app::defaultPublishChannels)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupChannels
