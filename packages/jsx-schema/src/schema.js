import validate from './validate'

/******************************************************************************/
// Main
/******************************************************************************/

class BaseSchema {

  static types = {}

  static validators = new Map()

  static create (type, props, children) {
    return new this(type, props, children)
  }

  static validate = validate

  constructor (type, props, children) {

    if (is.string(type))
      type = this.constructor.types?.[type]

    if (!is.func(type))
      throw new Error()

  }
}

class Schema extends BaseSchema {

  static types = {

    object: Object,
    string: String,

    bool: Boolean,
    boolean: Boolean,

    func: Function,
    function: Function,

    array: Array,
    number: Number,

    any: null
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Schema
