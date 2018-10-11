import is from 'is-explicit'

import Type from './type'

import propIsEnabled from '../util/prop-is-enabled'
import addName from '../util/add-name'

/******************************************************************************/
// Helper
/******************************************************************************/

const { VALIDATORS } = Type

const isObjectAndNotArray = value => is.object(value) && !is.array(value)

/******************************************************************************/
// Main
/******************************************************************************/

class ObjectType extends Type {

  constructor () {
    super(Object)
  }

  [VALIDATORS] (props, children) {

    if ('plain' in props && propIsEnabled(props.plain))
      this.props.plain = !!props.plain

    const plain = this.props.plain
    const isObjectTest = plain
      ? is.plainObject
      : isObjectAndNotArray

    const typeValidator = value =>
      is.defined(value) && isObjectTest(value)
        ? value
        : throw new Error(`must be a${plain ? ' plain' : 'n'} object`)

    typeValidator::addName(`is${plain ? 'Plain' : ''}Object`)

    return [
      super[VALIDATORS](props, children),
      typeValidator
    ]

  }

  // strict () { }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ObjectType
