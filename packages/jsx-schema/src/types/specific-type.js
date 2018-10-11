import is from 'is-explicit'

import addName from '../util/add-name'
import propIsEnabled from '../util/prop-is-enabled'

import Type from './type'

/******************************************************************************/
// Data
/******************************************************************************/

// Symbols
const { VALIDATORS, ROOT } = Type

/******************************************************************************/
// Main
/******************************************************************************/

class SpecificType extends Type {

  constructor (type) {
    super(type)

    if (!is.instanceable(this[ROOT]))
      throw new Error(`${this.constructor.name} requires an instanceable type.`)
  }

  cast (prop) {

    if (!propIsEnabled(prop))
      return null

    if (prop === true)
      throw new Error(`${this.constructor.name} does not have a default casting function.`)

    else if (!is.func(prop))
      throw new Error('cast validator requires a function')

    const castFunction = this.props.cast = prop
    const rootType = this[ROOT]

    const validator = value =>
      value != null && !is(value, rootType)
        ? castFunction(value)
        : value

    return validator::addName(`castTo${rootType && rootType.name}`)
  }

  [VALIDATORS] (props, children) {

    if (children && children.length > 0)
      throw new Error(`${this.constructor.name} cannot have nested children.`)

    let castValidator
    let typeValidator

    // cast validator
    if ('cast' in props)
      castValidator = this.cast(props.cast)

    const rootType = this[ROOT]

    // type validator
    if (is.defined(rootType)) {

      typeValidator = value =>
        value == null || is(value, rootType)
          ? value
          : throw new Error(`must be of type: ${rootType.name}`)

      typeValidator::addName(`is${rootType.name}`)
    }

    // root validators
    const genericValidators = super[VALIDATORS](props, children)

    return [
      castValidator,
      genericValidators,
      typeValidator
    ]
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default SpecificType
