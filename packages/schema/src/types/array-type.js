import is from 'is-explicit'
import Type from './type'
import { $$sync } from './object-type'

import { wrap } from '@benzed/array'

import { define, propIsEnabled, runValidators, isSchema, $$schema } from '../util'

/******************************************************************************/
// Validators
/******************************************************************************/

const isArray = value =>
  !is.defined(value) || is.array(value)
    ? value
    : throw new Error('must be an array')

function isArrayOf (array, context) {

  const [ schema ] = this

  let async = null

  array = isArray(array)
  if (array) for (let i = 0; i < array.length; i++) {
    const value = array[i]

    const { validators } = schema[$$schema]

    const result = runValidators(validators, value, context.push(i))
    if (is(result, Promise)) {
      async = async || Array(array.length).fill($$sync)
      async[i] = result
    } else
      array[i] = result
  }

  return async
    ? Promise
      .all(async)
      .then(results => {
        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          if (result === $$sync)
            continue

          if (is(result, Error))
            throw result

          array[i] = result
        }
        return array
      })

    : array
}

/******************************************************************************/
// Main
/******************************************************************************/

class ArrayType extends Type {

  constructor () {
    super(Array)
  }

  children (children) {
    const hasChildren = children && children.length > 0
    if (hasChildren && !isSchema(children[0]))
      throw new Error(`${this.constructor.name} child must be a schema, if defined`)

    if (hasChildren && children.length > 1)
      throw new Error(`${this.constructor.name} may have a maximum of one child`)

    const typeValidator = hasChildren
      ? children
        ::isArrayOf
        ::define({
          name: 'isArrayOf', priority: -50
        })

      : isArray::define({
        name: 'isArray', priority: -50
      })

    return typeValidator
  }

  cast (prop) {

    if (!propIsEnabled(prop))
      return null

    if (prop === true)
      prop = wrap

    const castFunc = prop
    if (!is.func(castFunc) && !is.arrayOf.func(castFunc))
      throw new Error(`${this.constructor.name} cast prop must be true or a function`)

    const validator = (value, context) =>
      is.defined(value) && !is.array(value)
        ? runValidators(wrap(castFunc), value, context)
        : value

    validator::define({
      name: 'castToArray',
      priority: -80
    })

    return {
      validator,
      prop: castFunc
    }
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ArrayType
