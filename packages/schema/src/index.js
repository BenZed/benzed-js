import createValidator from './create-validator'
import createPropTypesFor from './create-prop-types-for'

import { Type, SpecificType } from './types'

import {
  isSchema, propIsEnabled, propToConfig, propsPluck, mergeResults
} from './util'

/******************************************************************************/
// Exports
/******************************************************************************/

export default {

  createValidator,
  createPropTypesFor,

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
  createPropTypesFor,

  Type,
  SpecificType,

  isSchema,

  propIsEnabled,
  propToConfig,
  propsPluck,

  mergeResults
}
