import is from 'is-explicit'

import { wrap, hasNumericLength } from '@benzed/array'
import { copy, change, COPY } from '@benzed/immutable'
import { round } from '@benzed/math'

import addName from '../util/add-name'
import propIsEnabled from '../util/prop-is-enabled'
import propToConfig from '../util/prop-to-config'
import propToRangeAssert, { RANGE_LAYOUT } from '../util/prop-to-range-assert'

/******************************************************************************/
// Symbols
/******************************************************************************/

const VALIDATORS = Symbol('validators-create-method-or-created-array')
const ROOT = Symbol('root-type-constructor')

/******************************************************************************/
// Config
/******************************************************************************/

const requireConfig = propToConfig({
  name: 'err',
  test: is.string,
  default: 'is required.'
})

const LENGTH_LAYOUT = RANGE_LAYOUT::change(layout => {

  const ERR = 1
  const MIN = 2
  const MAX = 3
  const VALUE = 4

  layout[ERR].default = (diff, values) =>
    `length must be ${diff} ${values.join(' and ')}`

  layout[MIN].validate = layout[MAX].validate = layout[VALUE].validate =
    value => is.number(value) && value < 0
      ? throw new Error('must be above 0')
      : value

})

const propToLengthAssert = propToConfig(LENGTH_LAYOUT)::propToRangeAssert

/******************************************************************************/
// Helper
/******************************************************************************/

const findUnusedKeys = (source, match) => {

  const unused = []
  for (const key of Object.keys(match))
    if (key in source === false)
      unused.push(key)

  return unused
}

const getNumericValue = value => {

  const number = is.number(value)
    ? value
    : value.valueOf()

  if (!is.number(number))
    throw new Error('cannot compare range with non-numeric value')

  return number
}

const getNumericLength = value => {

  if (!hasNumericLength(value))
    throw new Error('value does not have a numeric length')

  return value.length
}

/******************************************************************************/
// Main
/******************************************************************************/

class Type {

  static VALIDATORS = VALIDATORS;
  static ROOT = ROOT;

  get [Symbol.toStringTag] () {
    return 'SchemaType'
  }

  [ROOT] = null
  children = null
  props = {}

  constructor (rootType) {
    this[ROOT] = rootType
  }

  [VALIDATORS] (props, children) {

    const validators = []

    for (const validatorName in props) {

      const isValidatorName = validatorName in this && is.func(this[validatorName])
      if (!isValidatorName)
        continue

      const validatorAlreadyCreated = validatorName in this.props
      if (validatorAlreadyCreated)
        continue

      const prop = props[validatorName]

      validators.push(this[validatorName](prop))

      const validatorInitializedPropValue = validatorName in this.props
      if (!validatorInitializedPropValue)
        this.props[validatorName] = prop
    }

    const unusedKeys = findUnusedKeys(this.props, props)
    if (unusedKeys.length > 0)
      throw new Error(`${this.constructor.name} given props for validators it` +
        ` does not handle: ${unusedKeys}`)

    this.children = children

    return validators
  }

  // Universal Validators

  required (prop) {
    if (!propIsEnabled(prop))
      return null

    const { err } = this.props.required = requireConfig(prop)

    const validator = value =>
      is.defined(value)
        ? value
        : throw new Error(err)

    return validator::addName('required')
  }

  range (prop) {

    if (!propIsEnabled(prop))
      return null

    const assertInRange = propToRangeAssert(prop)

    const { operator, min, max, value } = this.props.range = assertInRange.config

    const validator = value => {

      if (is.defined(value))
        assertInRange(getNumericValue(value))

      return value
    }

    const name = operator === '<=>'
      ? `range${round(min)}${operator}${round(max)}`
      : `range${operator}${round(value)}`

    return validator::addName(name)

  }

  length (prop) {
    if (!propIsEnabled(prop))
      return null

    const assertLength = propToLengthAssert(prop)
    const { operator, min, max, value } = this.props.length = assertLength.config

    const validator = value => {

      if (is.defined(value)) {
        const length = getNumericLength(value)
        assertLength(length)
      }

      return value
    }

    const name = operator === '<=>'
      ? `length${min}${operator}${max}`
      : `length${operator}${value}`

    return validator::addName(name)
  }

  default (prop) {

    // cant use propIsEnabled because false could be a default value
    if (!is.defined(prop))
      return null

    const setDefault = is.func(prop)
      ? prop
      : () => copy(prop)

    const validator = (value, context) =>
      is.defined(value)
        ? value
        : setDefault(context)

    return validator::addName('setDefault')
  }

  validate (prop) {
    if (!propIsEnabled(prop))
      return null

    const validators = wrap(prop)
    if (!is.arrayOf.func(validators))
      throw new Error('validate takes a validator function or an array thereof')

    return validators
  }

  [COPY] () {
    const Type = this.constructor

    const type = new Type(this[ROOT])

    return type
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Type
