import is from 'is-explicit'

import {
  define, propIsEnabled, propToConfig, propToRangeAssert,
  RANGE_LAYOUT
} from '../util'

import { wrap, hasNumericLength } from '@benzed/array'
import { copy } from '@benzed/immutable'

/******************************************************************************/
// Data
/******************************************************************************/

const $$root = Symbol('root-type')

const ANY_TYPE = Object.freeze({
  name: 'AnyType'
})

/******************************************************************************/
// Helper
/******************************************************************************/

const requireConfig = propToConfig({
  name: 'err',
  test: is.string,
  default: 'is required.'
})

const LENGTH_LAYOUT = RANGE_LAYOUT::copy(layout => {

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

  static $$root = $$root

  constructor (type = ANY_TYPE) {
    this[$$root] = type
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
      const result = this[validatorName](prop, props)

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

    validator::define({
      name: 'required', priority: -70
    })

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

    for (const validator of validators)
      validator::define({
        priority: 100
      })

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

    return validator::define({
      name: 'setDefault', priority: -100
    })
  }

  range (prop) {

    if (!propIsEnabled(prop))
      return null

    const assertInRange = propToRangeAssert(prop)

    prop = assertInRange.config

    const validator = value => {

      const number = is.number(value)
        ? value
        : value != null && value.valueOf()

      if (is.nan(number))
        throw new Error('could not determine range of NaN')

      if (is.number(number))
        assertInRange(number)

      return value
    }

    validator::define({
      name: 'range', priority: -25
    })

    return {
      validator,
      prop
    }
  }

  length (prop) {

    if (!propIsEnabled(prop))
      return null

    const assertLength = propToLengthAssert(prop)
    prop = assertLength.config

    const validator = value => {

      if (hasNumericLength(value))
        assertLength(value.length)

      return value
    }

    validator::define({
      name: 'length', priority: -25
    })

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
