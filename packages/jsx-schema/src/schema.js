import is from 'is-explicit'

import runValidators from './util/run-validators'
import { wrap as wrapInArray } from '@benzed/array'

import {
  ArrayType,
  EnumType,
  MultiType,
  ObjectType,
  SpecificType,
  // StringType,
  Type as GenericType
} from './types'

/******************************************************************************/
// Data
/******************************************************************************/

const VALIDATORS = GenericType.Validators

/******************************************************************************/
// Resolve Type
/******************************************************************************/

const resolveType = {
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

  // handles string types
  if (is.string(type) && type in this)
    type = PRIMITIVE_TYPE_HASH[type]
  else if (is.string(type))
    throw new Error(`${input} is not a recognized type`)

  // handles stock extended types
  if (type === Object)
    type = new ObjectType(type)

  else if (type === Array || is.subclassOf(type, Array))
    type = new ArrayType(type)

  else if (type == null)
    type = new GenericType()

  // else if (type === String)
  //   type = new StringType()

  // else if (type === Number)
  //   type = new NumberType()

  // else if (type === Boolean)
  //   type = new BooleanType()

  // handles custom extended types
  else if (is.subclassOf(type, GenericType)) {
    const CustomType = type
    type = new CustomType()

  // handles generic custom types
  } else if (is.func(type))
    type = new SpecificType(type)

  if (!is(type, GenericType))
    throw new Error(`${input} could not be resolved to a Schema.Type`)

  return type
}

/******************************************************************************/
// Main
/******************************************************************************/

class Schema {

  static Type = GenericType

  static create (type, props, ...children) {
    return new Schema(type, props, children)
  }

  [VALIDATORS] = null
  type = null

  constructor (type, props, children = []) {

    children = wrapInArray(children)
      .filter(is.defined)

    type = resolveType(type)
    let validators = type[VALIDATORS](props, children)

    if (is.array(validators))
      validators = validators.filter(is.defined)

    if (!is.arrayOf.func(validators))
      throw new Error(`${type.constructor.name} did not create an array of validators`)

    this[VALIDATORS] = validators
    this.type = type
  }

  validate (data) {
    return runValidators(this[VALIDATORS], data)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema
