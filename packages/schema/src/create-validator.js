import is from 'is-explicit'
import { wrap, flatten } from '@benzed/array'

import { Type } from './types'
import { runValidators, Context, $$schema } from './util'

import resolveCompiler from './resolve-compiler'

/******************************************************************************/
// Data
/******************************************************************************/

const { $$root } = Type

const SCHEMA_SHORTCUTS = {
  name:  { value: 'validate' },
  type:  { get () { return this[$$schema]?.type?.[$$root] }, enumerable: true },
  props: { get () { return this[$$schema].props }, enumerable: true },
  key:   { get () { return this[$$schema].key }, enumerable: true }
}

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperties } = Object

const addChildrenToProps = (props, children) => {

  const output = { ...props }

  output.children = children.length > 0
    ? flatten(children)
    : null

  return output
}

// Wrapped to prevent exposure of context and index arguments, and to wrap context
// in a validation error
function runValidatorsPublic (value, options = {}) {

  const schema = this

  const {
    data,
    // TODO determine weather or not validators should be able to mutate data
    // can be one of three options:
    //   'allowed' - validators are allowed to perform mutations
    //   'ignore' - data mutations made by validators are ignored
    //   'throw' - if a validator tries to mutate data, it throws instead
    mutate = 'allowed' // eslint-disable-line no-unused-vars
  } = options

  const context = new Context(schema.key, value, data)
  const { validators } = schema

  return runValidators(validators, value, context)

}

const byPriority = (a, b) => {

  const ap = a.priority || 0
  const bp = b.priority || 0

  return ap > bp
    ? 1
    : ap < bp
      ? -1
      : 0
}

/******************************************************************************/
// Validator psuedo type
/******************************************************************************/

function Validator (input, props = {}) {

  let compiler
  let key
  if ('key' in props) {
    key = props.key
    delete props.key
  }

  // resolve compiler
  const isType = is(input, Type)
  const isSchema = !isType && $$schema in input
  if (isSchema && 'children' in props && !is.defined(props.children))
    delete props.children

  if (isSchema) {
    props = { ...input[$$schema].props, ...props }
    compiler = input[$$schema].compiler

  } else if (isType)
    compiler = ::input.compile

  else
    compiler = input

  // compile
  let validators = compiler(props)

  // handle advanced results
  const isAdvancedResult = is.plainObject(validators)
  if (isAdvancedResult) {
    props = validators.props
    validators = validators.validators
  }

  // check validators
  validators = validators
    ::wrap()
    ::flatten()
    .filter(is.defined)

  if (!validators.every(is.func))
    throw new Error('compilers must return a validator or array of validators')

  // TEMP HACK okay, so I've gone and added priorities to all the stock validators
  // so that they are run in an order that makes sense. By default, validations
  // will happen in this order:
  // default -> cast -> required -> type -> mutate -> extended -> custom
  // Where extended are validators defined by extending type classes, and custom
  // are validators defined by the 'validate' or 'validates' property.
  // This doesn't solve all use cases, and is not very elegant, but it will do
  // until I come up with something better.
  validators.sort(byPriority)

  // check props
  if (!is.plainObject(props))
    throw new Error('props must be a plain object')

  const type = isSchema
    ? input[$$schema].type
    : isType
      ? input
      : {
        [$$root]: {
          name: input?.name || '(anonymous)'
        }
      }

  const schema = { compiler, props, validators, type, key }

  // decorate validator function with schema properties
  const validator = schema::runValidatorsPublic

  return defineProperties(validator, {
    ...SCHEMA_SHORTCUTS,
    [$$schema]: { value: schema }
  })

}

/******************************************************************************/
// Factory
/******************************************************************************/

function createValidator (type, props, ...children) {

  props = addChildrenToProps(props, children)

  const resolve = is.func(this)
    ? this
    : resolveCompiler

  return new Validator(resolve(type), props)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default createValidator

export { $$schema }
