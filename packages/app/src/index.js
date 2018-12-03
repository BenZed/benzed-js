import declareEntity from './declare-entity'
import run from './run'
import getConfig from './get-config'

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
  getConfig,

  hooks,
  schemas,

  QuickHook
}

export {
  declareEntity,
  run,
  getConfig,

  hooks,
  schemas,

  QuickHook
}
