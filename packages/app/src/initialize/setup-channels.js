import { isEnabled } from '../configure'

/******************************************************************************/
// Main
/******************************************************************************/

function setupChannels () {

  const { feathers } = this

  const socketio = feathers.get('socketio')
  if (!socketio || socketio.enabled === false)
    return

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

  // Publish events
  for (const name in feathers.services) {
    const service = feathers.services[name]
    const config = feathers.settings.services[name]
    if (!config)
      continue

    const channels = [
      authEnabled && 'authenticated',
      (!authEnabled || !config.auth) && 'anonymous'
    ]

    service.publish(() => feathers.channel(...channels))
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupChannels
