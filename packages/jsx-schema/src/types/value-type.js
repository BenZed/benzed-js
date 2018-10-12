import is from 'is-explicit'
import { wrap } from '@benzed/array'
import { includes as valueEqual } from '@benzed/immutable'

import Type from './type'
import { inspect } from 'util'

import addName from '../util/add-name'
import propIsEnabled from '../util/prop-is-enabled'

/******************************************************************************/
// Data
/******************************************************************************/

const { VALIDATORS } = Type

/******************************************************************************/
// Equality Checks
/******************************************************************************/

const referenceEqual = (values, value) =>
  values.includes(value)

/******************************************************************************/
// Validators
/******************************************************************************/

function checkValue (values, equalityCheck) {

  if (values.length === 1) {

    values = values[0]

    values = is.string(values)
      ? values.split(/\s+/)
      : wrap(values)
  }

  const validator = value =>
    equalityCheck(values, value)
      ? value
      : throw new Error(`must be either: ${values.map(inspect).join(', ')}`)

  return validator::addName('checkValue')

}

/******************************************************************************/
// Main
/******************************************************************************/

class ValueType extends Type {

  constructor () {
    super(null)
  }

  [VALIDATORS] (props, children) {

    const hasChildren = children && children.length > 0
    if (!hasChildren)
      throw new Error(`${this.constructor.name} must have children`)

    if ('deep' in props)
      this.props.deep = props.deep

    const { deep } = this.props
    const equalityCheck = propIsEnabled(deep)
      ? deep === true
        ? valueEqual
        : deep
      : referenceEqual

    if (!is.func(equalityCheck))
      throw new Error('custom deep equality check prop must be a function')

    const typeValidator = checkValue(children, equalityCheck)

    return [
      super[VALIDATORS](props, children),
      typeValidator
    ]
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ValueType
