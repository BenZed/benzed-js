import is from 'is-explicit'
import { wrap } from '@benzed/array'

import { Type } from './types'
import { runValidators as run, resolveCompiler } from './util'

/******************************************************************************/
// Data
/******************************************************************************/

const SCHEMA = Symbol('schema-data')
const ROOT = Type.ROOT

const SCHEMA_SHORTCUTS = {
  name: { value: 'validate' },
  type: { get () { return this[SCHEMA]?.type?.[ROOT] }, enumerable: true },
  props: { get () { return this[SCHEMA].props }, enumerable: true },

  // lol, should really just be { value: true }
  isSchema: { get () { return SCHEMA in this }, enumerable: true }
}

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperties } = Object

const addChildrenToProps = (props, children) => {

  const output = { ...props }

  output.children = children.length > 0
    ? [ ...children ]
    : null

  return output
}

/******************************************************************************/
// Validator psuedo type
/******************************************************************************/

function Validator (input, props = {}) {

  let compiler

  const isType = is(input, Type)
  const isSchema = !isType && SCHEMA in input
  if (isSchema) {
    props = { ...input[SCHEMA].props, ...props }
    compiler = input[SCHEMA].compiler

  } else if (isType)
    compiler = ::input.compile

  else
    compiler = input

  let validators = compiler(props)

  // handle advanced results
  const isAdvancedResult = is.plainObject(validators)
  if (isAdvancedResult) {
    props = validators.props
    validators = validators.validators
  }

  // check validators
  validators = wrap(validators)
  if (!validators.every(is.func))
    throw new Error('compilers must return a validator or array of validators')

  // check props
  if (!is.plainObject(props))
    throw new Error('props must be a plain object')

  // decorate validator function with schema properties
  const validator = validators::run

  const type = isSchema
    ? input[SCHEMA].type
    : isType
      ? input
      : null

  const schema = {
    compiler,
    props,
    type
  }

  return defineProperties(validator, {
    ...SCHEMA_SHORTCUTS,
    [SCHEMA]: { value: schema }
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

export { SCHEMA }
