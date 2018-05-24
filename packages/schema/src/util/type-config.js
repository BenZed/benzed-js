import is from 'is-explicit'
import { TYPE, CAST } from './symbols'
import argsToConfig from './args-to-config'
import normalizeValidator from './normalize-validator'

import { shift, unshift, push, pop, set } from '@benzed/immutable'

/******************************************************************************/
// Helper
/******************************************************************************/

const isArray = Array::is

const hasCastSymbol = has =>
  func => is(func, Function) && CAST in func === has

function getTypeName (type) {
  return type[TYPE] || type.name
}

function normalizeValidators (validators) {

  if (!validators)
    return validators

  return isArray(validators)
    ? validators.map(normalizeValidator)
    : normalizeValidator(validators)

}

/******************************************************************************/
// Layout
/******************************************************************************/

const typeLayout = [
  {
    name: 'type',
    required: true,
    test: [is.func, hasCastSymbol(false)],
    validate: normalizeValidators
  },
  {
    name: 'err',
    test: is.string
  },
  {
    name: 'validators',
    count: Infinity,
    default: [],
    test: [is.func, hasCastSymbol(false)],
    validate: normalizeValidators
  },
  {
    name: 'cast',
    test: [is.func, hasCastSymbol(true)],
    validate: normalizeValidators
  }
]

/******************************************************************************/
// Type Configurations
/******************************************************************************/

const typeConfig = argsToConfig(typeLayout, 'type')

const anyTypeConfig = argsToConfig(typeLayout[2], 'anyType')

const specificTypeConfig = argsToConfig(
  typeLayout
    ::shift(),

  'type'
)

const arrayTypeConfig = argsToConfig(
  typeLayout
    ::pop(),

  'arrayType'
)

const enumTypeConfig = argsToConfig(
  typeLayout
    ::shift()
    ::unshift({
      name: 'values',
      required: true,
      test: Array::is
    }),

  'enumType'
)

const objectConfig = argsToConfig(
  typeLayout
    ::shift()
    ::push({
      name: 'shape',
      test: is.plainObject
    },
    {
      name: 'shapeKeysOnly',
      test: is.bool
    },
    {
      name: 'cast',
      test: is.func
    }),

  'objectType'
)

const multiTypeConfig = argsToConfig(
  typeLayout
    ::set([0, 'count'], Infinity)
    ::set([0, 'name'], 'types')
    ::pop(),

  'multiType'
)

/******************************************************************************/
// Exports
/******************************************************************************/

export default typeConfig

export {
  typeConfig,
  specificTypeConfig,
  anyTypeConfig,
  objectConfig,
  arrayTypeConfig,
  multiTypeConfig,
  enumTypeConfig,

  typeLayout,
  getTypeName
}
