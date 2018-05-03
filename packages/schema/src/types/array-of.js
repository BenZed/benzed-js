import { wrap } from '@benzed/array'
import {

  reduceValidator,
  TYPE, TYPE_TEST_ONLY

} from '../util'

import { typeConfig, isType, castToType, getTypeName } from './type-of'

/******************************************************************************/
// arrayOf
/******************************************************************************/

function arrayOf (...args) {

  const config = typeConfig(args)
  const { err, cast } = config

  // Because arrayOf can use other type functions, this is an elegant way
  // to reduce methods that have OPTIONAL_CONFIG enabled
  const Type = reduceValidator(config.type)

  const typeName = `Array of ${getTypeName(Type)}s`

  const arrayOf = (array, context) => {

    const testOnly = context === TYPE_TEST_ONLY

    array = wrap(array)

    for (let i = 0; i < array.length; i++) {
      let value = array[i]

      if (isType(value, Type))
        continue

      value = castToType(value, cast, Type)

      if (!isType(value, Type))
        return testOnly
          ? false
          : new Error(
            err ||
            `Must be an ${typeName}`
          )
      else
        array[i] = value
    }

    return testOnly ? true : array
  }

  arrayOf[TYPE] = typeName

  return arrayOf

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default arrayOf
