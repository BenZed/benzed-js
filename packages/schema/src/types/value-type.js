import is from 'is-explicit'
import { wrap } from '@benzed/array'
import { includes as valueEqual } from '@benzed/immutable'

import Type from './type'
import { inspect } from 'util'

import { define, propIsEnabled, propsPluck, mergeResults } from '../util'

/******************************************************************************/
// Equality Checks
/******************************************************************************/

const referenceEqual = (values, value) =>
  values.includes(value)

/******************************************************************************/
// Validators
/******************************************************************************/

function resolveChildren (values, name) {

  const hasChildren = values && values.length > 0
  if (!hasChildren)
    throw new Error(`${name} must have children`)

  if (values.length === 1) {
    values = values[0]
    values = is.string(values)
      ? values.split(/\s+/)
      : wrap(values)
  }

  return values
}

function checkValue (values, equalityCheck) {

  const validator = value =>
    equalityCheck(values, value)
      ? value
      : throw new Error(`must be one of: ${values.map(inspect).join(', ')}`)

  return validator::define({
    name: 'isOneOf', priority: -50
  })

}

function valueValidators (props, name) {

  props.children = resolveChildren(props.children, name)

  const hasDeep = 'deep' in props

  let equalityCheck = referenceEqual
  if (hasDeep)
    equalityCheck = props.deep = propIsEnabled(props.deep)
      ? props.deep === true
        ? valueEqual
        : props.deep
      : equalityCheck

  if (!is.func(equalityCheck))
    throw new Error('custom deep equality check prop must be a function')

  const validators = checkValue(props.children, equalityCheck)

  return {
    validators,
    props
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

class ValueType extends Type {

  constructor () {
    super(null)
  }

  compile (props) {

    const valueProps = propsPluck(props, 'deep', 'children')

    return mergeResults(
      super.compile(props),
      valueValidators(valueProps, this.constructor.name)
    )
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ValueType
