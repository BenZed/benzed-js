import { isApp } from '../util'
import { MustBeEmpty } from './validation' // eslint-disable-line
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Helper
/******************************************************************************/

function defaultChannelsWithAuth () {

  const app = this

  app.on('connection', connection => {
    app.channel('anonymous').join(connection)
  })

  app.on('login', (payload, { connection }) => {
    if (connection) {
      app.channel('anonymous').leave(connection)
      app.channel('authenticated').join(connection)
    }
  })

  // A global publisher that sends all events to all authenticated clients
  app.publish((data, context) => app.channel('authenticated'))
}

function defaultChannels () {

  const app = this

  app.on('connection', connection => {
    app.channel('connected').join(connection)
  })

  app.publish((data, context) => app.channel('connected'))

}

/******************************************************************************/
// Validate
/******************************************************************************/

const validate = <object key='channels'>
  <MustBeEmpty key='children' />
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const channels = props => {

  validate(props)

  return (io, app) => {

    if (!isApp(app) || io !== app.io)
      throw new Error('<channels/> must be parented to <socketio/>')

    if (app.settings.auth)
      app::defaultChannelsWithAuth()
    else
      app::defaultChannels()

  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default channels
