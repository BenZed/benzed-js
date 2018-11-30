import { milliseconds } from '@benzed/async'
import { $$entity } from './util'

/******************************************************************************/
// Data
/******************************************************************************/

const EXIT_ERROR = 1

const KILL_WAIT = 500 // ms

/******************************************************************************/
// Helper
/******************************************************************************/

async function kill (err) {

  const app = this

  if (app)
    await app.end()

  if (err && process.env.NODE_ENV !== 'test') {
    console.error(err)
    await milliseconds(KILL_WAIT)
    process.exit(EXIT_ERROR)

  }

  if (err)
    throw err
}

/******************************************************************************/
// Main
/******************************************************************************/

async function run (entity) {

  if (this !== undefined && entity === undefined)
    entity = this

  let app

  try {
    app = await entity()
  } catch (err) {
    return app::kill(err)
  }

  try {

    await app.start()
    return app

  } catch (err) {
    return app::kill(err)
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default run
