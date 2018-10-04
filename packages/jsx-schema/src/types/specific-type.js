import is from 'is-explicit'

import addName from '../util/add-name'
import Type from './type'

/******************************************************************************/
// Data
/******************************************************************************/

const VALIDATORS = Type.Validators

/******************************************************************************/
// Main
/******************************************************************************/

class SpecificType extends Type {

  cast (castFunction) {

    if (!castFunction)
      return null

    if (castFunction === true)
      throw new Error(`${this.constructor.name} cast validator does not have a default casting function.`)

    else if (!is.func(castFunction))
      throw new Error('cast validator requires a function')

    const validator = value =>
      is.defined(value) && !is.type(this.type)
        ? castFunction(value)
        : value

    return validator::addName(`cast-to-${this.type && this.type.name}`)
  }

  [VALIDATORS] (props, children) {

    if (children && children.length > 0)
      throw new Error(`${this.constructor.name} cannot have nested children.`)

    props = { ...props }

    const specificValidators = []

    // cast validator
    if ('cast' in props) {
      specificValidators.push(
        this.cast(props.cast)
      )
      delete props.cast
    }

    // type validator
    if (is.defined(this.type)) {

      const typeValidator = (value =>
        !is.defined(value) || is(value, this.type)
          ? value
          : throw new Error(`must be of type: ${this.type.name}`)

      )::addName(`type-of-${this.type.name}`)

      specificValidators.push(
        typeValidator
      )
    }

    // root validators
    const genericValidators = super[Type.Validators](props, children)

    return [
      ...specificValidators,
      ...genericValidators
    ]
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default SpecificType
