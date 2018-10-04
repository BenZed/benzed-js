import is from 'is-explicit'
import addName from '../util/add-name'

import { wrap, flatten } from '@benzed/array'

/******************************************************************************/
// Symbols
/******************************************************************************/

const VALIDATORS = Symbol('validators-create-method-or-created-array')
const TYPE = Symbol('root-type-constructor')

/******************************************************************************/
// Main
/******************************************************************************/

class Type {

  static Validators = VALIDATORS;

  get type () {
    return this[TYPE]
  }

  constructor (type) {
    this[TYPE] = type
  }

  [VALIDATORS] (props, children) {

    const validators = []

    props = { ...props }

    for (const key in props) {

      const isValidatorName = key in this && is.func(this[key])
      if (!isValidatorName)
        continue

      const prop = props[key]

      validators.push(this[key](prop))
      delete props[key]
    }

    const remainingKeys = Object.keys(props)
    if (remainingKeys.length > 0)
      throw new Error(`${this.constructor.name} given props for validators it` +
        ` does not handle: ${remainingKeys}`)

    return flatten(validators)
  }

  // Universal Validators

  required (config) {
    if (!config)
      return null

    const validator = value =>
      is.defined(value)
        ? value
        : throw new Error('is required.')

    return validator::addName('required')
  }

  default () {

  }

  validate (config) {
    if (!is.defined(config))
      return null

    config = wrap(config)
    if (!is.arrayOf.func(config))
      throw new Error('validate takes a validator function or an array thereof')

    return config
  }

  validates = this.validate
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Type
