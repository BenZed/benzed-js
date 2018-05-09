import { milliseconds } from '@benzed/async'

/******************************************************************************/
// Data
/******************************************************************************/

const EXIT_ERROR = 1

// const EXIT_CLEAN = 0

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

async function run (config) {

  const App = this
  let app

  try {
    app = new App(config)
  } catch (err) {
    console.log(`app could not be configured: ${err.message}`)
    return app::kill()
  }

  try {
    await app.initialize()
  } catch (err) {

    app.log`app could not be initialized: ${err.message}`
    return app::kill()
  }

  try {
    await app.start()
    app.log`app listening on ${app.get('port')}`

  } catch (err) {
    app.log`app could not start: ${err.message}`
    return app::kill()
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default run
