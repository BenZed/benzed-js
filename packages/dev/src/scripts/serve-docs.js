import { milliseconds } from '@benzed/async'

import api from '../documentation/api'

/******************************************************************************/
// Helper
/******************************************************************************/

async function kill () {

  const KILL_WAIT = 500 // ms
  await milliseconds(KILL_WAIT)

  const EXIT_ERROR = 1
  process.exit(EXIT_ERROR)

}

/******************************************************************************/
// Run
/******************************************************************************/

async function run (api) {

  let app
  try {
    app = await api()
  } catch (e) {
    if (app)
      app.log`documentation-api could not be configured: \n${e}`
    else
      console.error(e.name, e.message)
    return app::kill()
  }

  try {
    await app.start()
    app.log`documentation-api running on port ${app.get('port')}`
  } catch (e) {
    app.log`documentation-api could not be started: \n${e}`
    return app::kill()
  }

}

/******************************************************************************/
// Execute
/******************************************************************************/

run(api)
