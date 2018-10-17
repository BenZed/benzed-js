import is from 'is-explicit'

import Type from './type'

import { addName, propIsEnabled, propsPluck, mergeResults, isSchema } from '../util'

/******************************************************************************/
// Helper
/******************************************************************************/

const isObjectAndNotArray = value =>
  is.object(value) && !is.array(value)

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
    const result = schema(value, context)

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

  compile (props) {

    const typeProps = propsPluck(props, 'children', 'strict', 'plain')

    const { children, plain, strict } = typeProps

    // check children
    const hasChildren = children && children.length > 0
    if (hasChildren && !children.every(isSchema))
      throw new Error(`${this.constructor.name} children must be schemas`)

    if (hasChildren && !children::haveUniqueKeys())
      throw new Error(`${this.constructor.name} children must have unique keys`)

    const childValidator = children
      ? children::runValidatorsOnEach
      : null

    // consume 'plain' prop
    const isObjectTest = propIsEnabled(plain)
      ? is.plainObject
      : isObjectAndNotArray

    const typeValidator = value =>
      is.defined(value) && isObjectTest(value)
        ? value
        : throw new Error(`must be a${plain ? ' plain' : 'n'} object`)

    typeValidator::addName(`is${plain ? 'Plain' : ''}Object`)

    // consume 'strict' prop
    if (strict && !hasChildren)
      throw new Error(`${this.constructor.name} strict can only be enabled on schemas with children`)

    const strictValidator = strict
      ? children::restrictToKeys
      : null

    return mergeResults(
      typeValidator,
      childValidator,
      super.compile(props),
      strictValidator,
      typeProps
    )

  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ObjectType
