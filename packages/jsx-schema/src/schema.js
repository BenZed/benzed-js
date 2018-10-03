import is from 'is-explicit'

import { COPY, EQUALS, equals, merge } from '@benzed/immutable'
import { flatten } from '@benzed/array'

import { VALIDATORS, TYPE } from './symbols'
import * as types from './types'
import runValidators from './run-validators'

import Context from './context'

/******************************************************************************/
// Helper
/******************************************************************************/

const isTypeFunc = func =>

  is.func(func) && TYPE in func

/******************************************************************************/
// Main
/******************************************************************************/

class Schema {

  static resolveType (input) {

    let type = input

    if (type === null)
      type = types.any

    else if (type === Object)
      type = types.object

    else if (is.string(type) && type in types && type !== 'default')
      type = types[type]

    if (!is.func(type))
      throw new Error(`'${input}' is not a recognized type.`)

    const isType = isTypeFunc(type)
    if (!isType)
      type = types.typeOf(input)

    return type
  }

  static create (type, props, ...children) {

    const Schema = this

    return new Schema(type, props, children)
  }

  [VALIDATORS] = []
  type = null
  props = null
  children = null

  constructor (type, props, children = []) {

    const Schema = this.constructor

    if (!is.defined(props))
      props = {}

    if (!is.plainObject(props))
      throw new Error('props must be a plain object')

    if (is(type, Schema))
      throw new Error('nesting schemas not yet supported')
      // const schema = type
      //
      // props = merge(schema.props, props)
      // type = schema.type

    this.type = Schema.resolveType(type)
    if (!isTypeFunc(this.type))
      throw new Error('Schema.resolveType did not return a type function')

    this.props = props
    this.children = flatten(children).filter(is.defined)

    this[VALIDATORS] = this.type(this.props, this.children)
  }

  validate (data) {
    return runValidators(this[VALIDATORS], data)
  }

  [COPY] () {

    const Schema = this

    return new Schema(
      this.type,
      this.props,
      this.children
    )
  }

  [EQUALS] (other) {
    return this.type === other.type &&
      equals(this.props, other.props) &&
      equals(this.children, other.children)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema
