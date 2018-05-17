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
    type: Function,
    required: true,
    test: hasCastSymbol(false),
    validate: normalizeValidators
  },
  {
    name: 'err',
    type: String
  },
  {
    name: 'validators',
    type: Function,
    count: Infinity,
    default: [],
    test: hasCastSymbol(false),
    validate: normalizeValidators
  },
  {
    name: 'cast',
    type: Function,
    test: hasCastSymbol(true)
  }
]

/******************************************************************************/
// Type Configurations
/******************************************************************************/

const anyTypeConfig = argsToConfig(typeLayout[2])
const typeConfig = argsToConfig(typeLayout)
const specificTypeConfig = argsToConfig(typeLayout.slice(1))
const arrayTypeConfig = argsToConfig(typeLayout.slice(0, 3))

const objectConfig = argsToConfig(
  typeLayout
    ::shift()
    ::push({
      name: 'shape',
      test: is.plainObject
    },
    {
      name: 'shapeKeysOnly',
      type: Boolean
    },
    {
      name: 'cast',
      type: Function
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
