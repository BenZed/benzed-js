import is from 'is-explicit'

import runValidators from './util/run-validators'

import { wrap as wrapInArray, flatten } from '@benzed/array'
import { copy } from '@benzed/immutable'

import {

  GenericType,
  SpecificType,

  BooleanType,
  StringType,
  NumberType,

  ObjectType,
  ArrayType,

  EnumType,
  MultiType

} from './types'

/******************************************************************************/
// Data
/******************************************************************************/

const { VALIDATORS, ROOT } = GenericType // it's a symbol

/******************************************************************************/
// Helpers
/******************************************************************************/

const resolveSchemaType = {
  string: String,
  number: Number,
  bool: Boolean,
  boolean: Boolean,
  array: Array,
  arrayOf: Array,
  object: Object,
  objectOf: Object,
  symbol: Symbol,
  func: Function,
  function: Function,
  oneOf: EnumType,
  oneOfType: MultiType,
  map: Map,
  set: Set,
  any: GenericType
}::function (input) {

  let type = input
  const PRIMITIVE_TYPE_HASH = this

  const isString = is.string(type)

  // handles string types
  if (isString && type in this)
    type = PRIMITIVE_TYPE_HASH[type]
  else if (isString)
    throw new Error(`${input} is not a recognized type`)

  if (is.defined(type) && !is.func(type))
    throw new Error(`type argument must be null, a string or a function. Was given: ${String(input)}`)

  // handles stock extended types
  if (type === Object)
    type = new ObjectType(type)

  else if (type === Array || is.subclassOf(type, Array))
    type = new ArrayType(type)

  else if (type === Boolean)
    type = new BooleanType()

  else if (type === Number)
    type = new NumberType()

  else if (type === String)
    type = new StringType()

  else if (type == null)
    type = new GenericType()

  // handles custom extended types
  else if (is.subclassOf(type, GenericType)) {
    const CustomType = type
    type = new CustomType()

  // handles generic custom types
  } else if (is.func(type))
    type = new SpecificType(type)

  if (!is(type, GenericType))
    throw new Error(`${String(input)} could not be resolved to a Schema.Type`)

  return type
}

function getValidators (schemaType, props, children) {

  let validators = schemaType[VALIDATORS](copy(props), children)

  if (!is.array(validators))
    throw new Error(`${schemaType.constructor.name} did not create an array.`)

  validators = validators::flatten().filter(is.defined)

  if (!validators.every(is.func))
    throw new Error(`${schemaType.constructor.name} did not create an array of validators`)

  return validators
}

/******************************************************************************/
// Main
/******************************************************************************/

class Schema {

  static Type = GenericType

  static create (type, props, ...children) {

    const Schema = this

    return new Schema(type, props, children)
  }

  [VALIDATORS] = null
  schemaType = null

  get type () {
    return this.schemaType?.[ROOT]
  }

  get props () {
    return this.schemaType?.props
  }

  constructor (type, props = {}, children = []) {

    if (!is.defined(props))
      props = {}

    if (!is.plainObject(props))
      throw new Error('props must be a plain object')

    children = wrapInArray(children)
      .filter(is.defined)

    const schemaType = resolveSchemaType(type)
    const validators = getValidators(schemaType, props, children)

    this[VALIDATORS] = validators
    this.schemaType = schemaType
  }

  validate (data) {

    const validators = this[VALIDATORS]

    return runValidators(validators, data)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema

export {
  Schema
}
