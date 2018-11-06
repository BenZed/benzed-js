import Type from './type'

import { wrap } from '@benzed/array'

import is from 'is-explicit'

import { define, runValidators, propIsEnabled, mergeResults } from '../util'

/******************************************************************************/
// Data
/******************************************************************************/

const { $$root } = Type

/******************************************************************************/
// Main
/******************************************************************************/

class SpecificType extends Type {

  constructor (type) {
    super(type)

    if (!is.instanceable(this[Type.$$root]))
      throw new Error(`${this.constructor.name} requires an instanceable type.`)
  }

  compile (props) {

    const rootType = this[$$root]

    let typeValidator = null
    if (is.defined(rootType)) {
      typeValidator = value =>
        value == null || is(value, rootType)
          ? value
          : throw new TypeError(`must be of type: ${rootType.name}`)

      typeValidator::define({
        name: `is${rootType.name}`, priority: -50
      })
    }

    return mergeResults(
      super.compile(props),
      typeValidator
    )
  }

  cast (prop) {

    if (!propIsEnabled(prop))
      return null

    const castFunc = prop
    if (castFunc === true)
      throw new Error(`${this.constructor.name} does not have a default casting function.`)

    else if (!is.func(castFunc) && !is.arrayOf.func(castFunc))
      throw new Error('cast validator requires a function')

    const rootType = this[$$root]

    const validator = (value, context) =>
      value != null && !is(value, rootType)
        ? runValidators(wrap(castFunc), value, context)
        : value

    validator::define({
      name: `castTo${rootType && rootType.name}`, priority: -80
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

export default SpecificType
