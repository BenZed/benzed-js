import is from 'is-explicit'

import Type from './type'

import {

  addName, propIsEnabled, propsPluck, mergeResults, runValidators,
  isSchema, SCHEMA

} from '../util'

/******************************************************************************/
// Data
/******************************************************************************/

const SYNC = Symbol('resolved-syncronously')

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

  const schemas = this
  let async = null

  if (!is.defined(object))
    return object

  for (let i = 0; i < schemas.length; i++) {

    const schema = schemas[i]

    const { validators, key } = schema[SCHEMA]
    const value = object[key]

    const result = runValidators(
      validators,
      value,
      context.push(key)
    )

    if (is(result, Promise)) {
      async = async || Array(schemas.length).fill(SYNC)
      async[i] = result

    } else if (result !== undefined || key in object)
      object[key] = result
  }

  return async
    ? Promise.all(async)
      .then(results => {

        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          if (result === SYNC)
            continue

          if (is(result, Error))
            throw result

          const { key } = schemas[i]
          if (result !== undefined || key in object)
            object[key] = result
        }

        return object
      })
    : object

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

  cast () {

  }

  compile (props) {

    const typeProps = propsPluck(props, 'children', 'strict', 'plain', 'cast')

    const { children, plain, strict, cast } = typeProps

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
      !is.defined(value) || isObjectTest(value)
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
      // castValidator
      super.compile(props),
      typeValidator,
      childValidator,
      strictValidator,
      typeProps
    )
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ObjectType

export { SYNC }
