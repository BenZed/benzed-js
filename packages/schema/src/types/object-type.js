import { wrap } from '@benzed/array'

import is from 'is-explicit'
import Type from './type'
import { inspect } from 'util'

import {

  define, propIsEnabled, propsPluck, mergeResults, runValidators, propToConfig,
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

const strictConfig = propToConfig({
  name: 'error',
  test: [String, Function, Boolean]::is
})

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
    ? Promise
      .all(async)
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

  const [ children, strict ] = this

  const error = strict?.error

  const goodKeys = []
  for (const schema of children)
    goodKeys.push(schema.key)

  const badKeys = []
  for (const key in object)
    if (!goodKeys.includes(key))
      if (error)
        badKeys.push(key)
      else
        delete object[key]

  if (badKeys.length > 0) {

    const msg = is.func(error)
      ? error(goodKeys, badKeys)
      : error === true
        ? `is limited to keys: ${inspect(...goodKeys)} received: ${inspect(...badKeys)}`
        : error

    throw new Error(msg)
  }

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

    const typeProps = propsPluck(props, 'children', 'strict', 'plain', 'cast')

    const { children, plain, cast } = typeProps

    // check children
    const hasChildren = children && children.length > 0
    if (hasChildren && !children.every(isSchema))
      throw new Error(`${this.constructor.name} children must be schemas`)

    if (hasChildren && !children::haveUniqueKeys())
      throw new Error(`${this.constructor.name} children must have unique keys`)

    const childValidator = children
      ? children::runValidatorsOnEach::define({
        name: 'shape', priority: -45
      })
      : null

    // consume 'plain' prop
    const isObjectTest = propIsEnabled(plain)
      ? is.plainObject
      : isObjectAndNotArray

    const typeValidator = value =>
      !is.defined(value) || isObjectTest(value)
        ? value
        : throw new Error(`must be a${plain ? ' plain' : 'n'} object`)

    typeValidator::define({
      name: `is${plain ? 'Plain' : ''}Object`, priority: -50
    })

    // consume 'strict' prop
    if (typeProps.strict && !hasChildren)
      throw new Error(`${this.constructor.name} strict can only be enabled on schemas with children`)

    // just <object strict /> should not throw errors
    if (typeProps.strict)
      typeProps.strict = strictConfig(typeProps.strict === true
        ? false
        : typeProps.strict
      )

    const strictValidator = typeProps.strict
      ? [ children, typeProps.strict ]
        ::restrictToKeys
        ::define({
          name: 'strict', priority: -40
        })
      : null

    // consume 'cast' prop
    const castIsEnabled = propIsEnabled(cast)
    if (castIsEnabled && !is.func(cast) && !is.arrayOf.func(cast))
      throw new Error(`${this.constructor.name} cast prop must be a function`)

    let castValidator
    if (castIsEnabled) {
      castValidator = (value, context) => !is.defined(value) || isObjectTest(value)
        ? value
        : runValidators(wrap(cast), value, context)

      castValidator::define({
        name: `castTo${plain ? 'Plain' : ''}Object`, priority: -80
      })
    }

    return mergeResults(
      castValidator,
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
