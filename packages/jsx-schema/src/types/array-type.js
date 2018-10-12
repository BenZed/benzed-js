import Type from './type'
import is from 'is-explicit'

import { wrap } from '@benzed/array'

import runValidators from '../util/run-validators'
import propIsEnabled from '../util/prop-is-enabled'
import addName from '../util/add-name'

import Schema from '../schema'

/******************************************************************************/
// Data
/******************************************************************************/

const { VALIDATORS } = Type

/******************************************************************************/
// Validators
/******************************************************************************/

const isArray = value =>
  !is.defined(value) || is.array(value)
    ? value
    : throw new Error('must be an array')

function isArrayOf (array, context) {

  const [ child ] = this

  array = isArray(array)

  for (let i = 0; i < array.length; i++) {
    const value = array[i]
    const result = runValidators(child[VALIDATORS], value, context)

    // TODO handle promise results
    array[i] = result
  }

  return array
}

/******************************************************************************/
// Main
/******************************************************************************/

class ArrayType extends Type {

  constructor () {
    super(Array)
  }

  [VALIDATORS] (props, children) {

    // check children
    const hasChildren = children && children.length > 0
    if (hasChildren && !is(children[0], Schema))
      throw new Error(`${this.constructor.name} child must be a schema, if defined`)

    if (hasChildren && children.length > 1)
      throw new Error(`${this.constructor.name} may have a maximum of one child`)

    const typeValidator = hasChildren
      ? children::isArrayOf
      : isArray

    return [
      super[VALIDATORS](props, children),
      typeValidator
    ]

  }

  cast (prop) {

    if (!propIsEnabled(prop))
      return null

    if (prop === true)
      prop = wrap

    const castFunc = this.props.cast = prop
    if (!is.func(castFunc))
      throw new Error(`${this.constructor.name} cast prop must be true or a function`)

    const validator = value =>
      is.defined(value) && !is.array(value)
        ? castFunc(value)
        : value

    return validator::addName(`castToArray`)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ArrayType
