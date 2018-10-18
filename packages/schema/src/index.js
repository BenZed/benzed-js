import createValidator from './create-validator'

import { Type, SpecificType } from './types'

import {
  isSchema, propIsEnabled, propToConfig, propsPluck, mergeResults
} from './util'

/******************************************************************************/
// Exports
/******************************************************************************/

export default {

  createValidator,

  Type,
  SpecificType,

  isSchema,

  propIsEnabled,
  propToConfig,
  propsPluck,

  mergeResults

}

export {
  createValidator,

  Type,
  SpecificType,

  isSchema,

  propIsEnabled,
  propToConfig,
  propsPluck,

  mergeResults
}
