import is from 'is-explicit'

import {
  addName, propIsEnabled, propToConfig, propToRangeAssert,
  RANGE_LAYOUT
} from '../util'

import { wrap, hasNumericLength } from '@benzed/array'
import { copy, change } from '@benzed/immutable'
import { round } from '@benzed/math'

/******************************************************************************/
// Data
/******************************************************************************/

const ROOT = Symbol('root-type')

/******************************************************************************/
// Helper
/******************************************************************************/

const requireConfig = propToConfig({
  name: 'err',
  test: is.string,
  default: 'is required.'
})

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
// Main
/******************************************************************************/

class Type {

  get [Symbol.toStringTag] () {
    return 'SchemaType'
  }

  static ROOT = ROOT

  constructor (type = null) {
    this[ROOT] = type
  }

  compile (props) {

    const validators = []
    const unusedKeys = []

    for (const validatorName in props) {

      if (validatorName === 'compile')
        continue

      const isValidatorName = validatorName in this && is.func(this[validatorName])
      if (!isValidatorName) {
        unusedKeys.push(validatorName)
        continue
      }

      const prop = props[validatorName]
      const result = this[validatorName](prop)

      const isAdvancedResult = is.plainObject(result)
      if (isAdvancedResult) {
        validators.push(result.validator)
        props[validatorName] = result.prop
      } else
        validators.push(result)

    }

    // const unusedKeys = findUnusedKeys(this.props, props)
    if (unusedKeys.length > 0)
      throw new Error(`${this.constructor.name} given props for validators it` +
        ` does not handle: ${unusedKeys}`)

    return {
      validators,
      props
    }
  }

  // Universal Validators

  children (children) {
    if (children && children.length > 0)
      throw new Error(`${this.constructor.name} cannot have nested children.`)
  }

  required (prop) {
    if (!propIsEnabled(prop))
      return null

    const { err } = prop = requireConfig(prop)

    const validator = value =>
      is.defined(value)
        ? value
        : throw new Error(err)

    validator::addName('required')

    return {
      validator,
      prop
    }
  }

  validate (prop) {
    if (!propIsEnabled(prop))
      return null

    const validators = wrap(prop)
    if (!is.arrayOf.func(validators))
      throw new Error('validate takes a validator function or an array thereof')

    return validators
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

  range (prop) {

    if (!propIsEnabled(prop))
      return null

    const assertInRange = propToRangeAssert(prop)

    const { operator, min, max, value } = prop = assertInRange.config

    const validator = value => {
      if (is.defined(value))
        assertInRange(getNumericValue(value))

      return value
    }

    const name = operator === '<=>'
      ? `range${round(min)}${operator}${round(max)}`
      : `range${operator}${round(value)}`

    validator::addName(name)

    return {
      validator,
      prop
    }
  }

  length (prop) {

    if (!propIsEnabled(prop))
      return null

    const assertLength = propToLengthAssert(prop)
    const { operator, min, max, value } = prop = assertLength.config

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

    validator::addName(name)

    return {
      validator,
      prop
    }
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Type
