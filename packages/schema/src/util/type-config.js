import is from 'is-explicit'
import { TYPE, CAST } from './symbols'
import argsToConfig from './args-to-config'
import normalizeValidator from './normalize-validator'

import { shift, push, pop, set } from '@benzed/immutable'

/******************************************************************************/
// Helper
/******************************************************************************/

const hasCastSymbol = has =>
  func => is(func, Function) && CAST in func === has

function getTypeName (type) {
  return type[TYPE] || type.name
}

function normalizeValidators (validators) {

  return validators instanceof Array
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
    test: [is.func, hasCastSymbol(true)]
  }
]

/******************************************************************************/
// Type Configurations
/******************************************************************************/

const anyTypeConfig = argsToConfig(typeLayout[2], 'anyType')
const typeConfig = argsToConfig(typeLayout, 'type')
const specificTypeConfig = argsToConfig(typeLayout.slice(1), 'type')
const arrayTypeConfig = argsToConfig(typeLayout.slice(0, 3), 'arrayType')

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
    })
)

const multiTypeConfig = argsToConfig(
  typeLayout
    ::set([0, 'count'], Infinity)
    ::set([0, 'name'], 'types')
    ::pop()
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

  typeLayout,
  getTypeName
}
