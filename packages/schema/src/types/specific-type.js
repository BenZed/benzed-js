import Type from './type'
import is from 'is-explicit'

import { addName, propIsEnabled } from '../util'

/******************************************************************************/
// Data
/******************************************************************************/

const { ROOT } = Type

/******************************************************************************/
// Main
/******************************************************************************/

class SpecificType extends Type {

  constructor (type) {
    super(type)

    if (!is.instanceable(this[Type.ROOT]))
      throw new Error(`${this.constructor.name} requires an instanceable type.`)
  }

  compile (props) {

    const rootType = this[ROOT]

    let typeValidator = null
    if (is.defined(rootType)) {
      typeValidator = value =>
        value == null || is(value, rootType)
          ? value
          : throw new TypeError(`must be of type: ${rootType.name}`)

      typeValidator::addName(`is${rootType.name}`)
    }

    const superResult = super.compile(props)

    superResult.validators.push(typeValidator)

    return superResult
  }

  cast (prop) {

    if (!propIsEnabled(prop))
      return null

    if (prop === true)
      throw new Error(`${this.constructor.name} does not have a default casting function.`)

    else if (!is.func(prop))
      throw new Error('cast validator requires a function')

    const castFunction = prop
    const rootType = this[ROOT]

    const validator = value =>
      value != null && !is(value, rootType)
        ? castFunction(value)
        : value

    validator::addName(`castTo${rootType && rootType.name}`)

    return {
      validator,
      prop
    }
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default SpecificType
