import { milliseconds } from '@benzed/async'

/******************************************************************************/
// Data
/******************************************************************************/

const EXIT_ERROR = 1

const KILL_WAIT = 500 // ms

/******************************************************************************/
// Helper
/******************************************************************************/

async function kill () {

  const app = this

  if (app)
    await app.end()

  await milliseconds(KILL_WAIT)

  process.exit(EXIT_ERROR)
}

/******************************************************************************/
// Main
/******************************************************************************/

async function run (entity) {

  let app

  try {
    app = await entity()
  } catch (err) {
    console.log(`app could not be mounted: \n${err}`)
    return app::kill()
  }

  try {
    await app.start()
    app.log`app listening on ${app.get('port')}`
  } catch (err) {
    app.log`app could not start: \n${err}`
    return app::kill()
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default run
