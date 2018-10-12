import is from 'is-explicit'

import Type from './type'
import Schema from '../schema'

import runValidators from '../util/run-validators'
import propIsEnabled from '../util/prop-is-enabled'
import addName from '../util/add-name'

/******************************************************************************/
// Data
/******************************************************************************/

const { VALIDATORS } = Type

/******************************************************************************/
// Helper
/******************************************************************************/

const isObjectAndNotArray = value => is.object(value) && !is.array(value)

function haveUniqueKeys () {

  const children = this

  const keys = {}

  for (const { key } of children) {

    if (!is.defined(key) || key in keys)
      return false

    keys[key] = true

  }

  return true
}

/******************************************************************************/
// Validators
/******************************************************************************/

function runValidatorsOnEach (object, context) {

  const children = this

  if (!is.defined(object))
    return object

  for (const schema of children) {

    const value = object[schema.key]

    const result = runValidators(
      schema[VALIDATORS],
      value,
      context)

    // TODO handle result as a promise

    object[schema.key] = result

  }

  return object

}

function restrictToKeys (object) {

  const children = this

  const keys = []
  for (const schema of children)
    keys.push(schema.key)

  for (const key in object)
    if (!keys.includes(key))
      delete object[key]

  return object
}

/******************************************************************************/
// Main
/******************************************************************************/

class ObjectType extends Type {

  constructor () {
    super(Object)
  }

  [VALIDATORS] (props, children) {

    // check children
    const hasChildren = children && children.length > 0
    if (hasChildren && !children.every(child => is(child, Schema)))
      throw new Error(`${this.constructor.name} children must be schemas`)

    if (hasChildren && !children::haveUniqueKeys())
      throw new Error(`${this.constructor.name} children must have unique keys`)

    const childValidator = children
      ? children::runValidatorsOnEach
      : null

    // consume 'plain' prop
    if ('plain' in props && propIsEnabled(props.plain))
      this.props.plain = !!props.plain

    const { plain } = this.props
    const isObjectTest = plain
      ? is.plainObject
      : isObjectAndNotArray

    const typeValidator = value =>
      is.defined(value) && isObjectTest(value)
        ? value
        : throw new Error(`must be a${plain ? ' plain' : 'n'} object`)

    typeValidator::addName(`is${plain ? 'Plain' : ''}Object`)

    // consume 'strict' prop
    if ('strict' in props && propIsEnabled(props.strict))
      this.props.strict = !!props.strict

    const { strict } = this.props
    if (strict && !hasChildren)
      throw new Error(`${this.constructor.name} strict can only be enabled on schemas with children`)

    const strictValidator = strict
      ? children::restrictToKeys
      : null

    // Combine
    return [
      typeValidator,
      childValidator,
      strictValidator,
      super[VALIDATORS](props, children)
    ]
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ObjectType
