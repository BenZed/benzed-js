import declareEntity from './declare-entity'
import run from './run'

import * as allHooks from './hooks'
import * as schemas from './schemas'

/******************************************************************************/
// Setup
/******************************************************************************/

const { default: QuickHook, ...hooks } = allHooks

/******************************************************************************/
// Exports
/******************************************************************************/

export default {
  declareEntity,
  run,
  hooks,
  schemas,

  QuickHook
}

export {
  declareEntity,
  run,
  hooks,
  schemas,

  QuickHook
}
