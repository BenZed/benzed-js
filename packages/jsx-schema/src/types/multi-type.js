import Type from './type'
import runValidators from '../util/run-validators'
import is from 'is-explicit'

import Schema from '../schema'

/******************************************************************************/
// Data
/******************************************************************************/

const { VALIDATORS } = Type

/******************************************************************************/
// Validators
/******************************************************************************/

function mustBeOneOf (value, context) {

  const children = this

  let pass = !is.defined(value)

  if (!pass) for (const schema of children) {
    try {
      const result = runValidators(
        schema[VALIDATORS],
        value,
        context
      )
      pass = true
      value = result
    } catch {
      // catching an error means the type is invalid
    }

    if (pass)
      break
  }

  if (!pass)
    throw new Error('invalid type')

  return value
}

/******************************************************************************/
// Main
/******************************************************************************/

class MultiType extends Type {

  constructor () {
    super(null)
  }

  [VALIDATORS] (props, children) {

    const hasChildren = children && children.length > 0
    if (hasChildren && !children.every(child => is(child, Schema)))
      throw new Error(`${this.constructor.name} must have schemas as children`)

    if (!hasChildren)
      throw new Error(`${this.constructor.name} must have children`)

    const typeValidator = children::mustBeOneOf

    return [
      super[VALIDATORS](props, children),
      typeValidator
    ]
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default MultiType
