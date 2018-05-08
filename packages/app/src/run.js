import { milliseconds } from '@benzed/async'

/******************************************************************************/
// Helper
/******************************************************************************/

async function kill () {

  const app = this

  if (app && app.listener)
    await app.end()

  if (app && app.database.process)
    await app.database.process.kill()

  await milliseconds(500)

  process.exit(1)
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
    console.log('app could not be configured:', err.message)
    app::kill()
  }

  try {
    await app.initialize()
  } catch (err) {

    console.log('app could not be initialized:', err.message)
    app::kill(1)
  }

  try {
    await app.start()
    console.log(`app listening on ${app.get('port')}`)

  } catch (err) {
    console.log(`app could not start:`, err.message)
    app::kill(1)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default run
