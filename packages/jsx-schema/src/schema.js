import is from 'is-explicit'
import { COPY, EQUALS, equals } from '@benzed/immutable'
import { flatten } from '@benzed/array'

import Type from './type'

/******************************************************************************/
// Base
/******************************************************************************/

const string = new Type(String)
const object = new Type(Object)

/******************************************************************************/
// Main
/******************************************************************************/

class Schema {

  static defaultTypes = new Map([
    [ 'string', string ],
    [ String, string ],
    [ 'object', object ],
    [ String, object ]
  ])

  static resolveType (input) {

    let type

    type = is(input, Type)
      ? input
      : Schema.defaultTypes.get(input)

    if (!is(type, Type) && is.func(type))
      type = new Type(type)

    if (!is(type, Type))
      throw new Error(`${String(input)} is not a recognized type.`)

    return type
  }

  static create (type, props, ...children) {
    return new this(type, props, children)
  }

  type = null
  props = null
  children = null

  constructor (type, props, children = []) {

    const Schema = this.constructor

    if (!is.defined(props))
      props = {}

    if (!is.plainObject(props))
      throw new Error('props must be a plain object')

    if (is(type, Schema)) {
      const schema = type

      props = { ...schema.props, ...props }
      type = schema.type

    }

    this.type = Schema.resolveType(type)
    this.props = props
    this.children = flatten(children)

  }

  validate (data) {

    data = this.type(data)

    return data
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
      equals(this.props, other.props)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema
