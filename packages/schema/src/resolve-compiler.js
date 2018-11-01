import is from 'is-explicit'
import {
  GenericType, SpecificType,
  StringType, NumberType, BooleanType,
  ArrayType, ObjectType, ValueType, MultiType//, UrlType
} from './types'

import { inspect } from 'util'

/******************************************************************************/
// Default Type Map
/******************************************************************************/

const TYPE_MAP = new Map([

  // stock types
  [ 'string', StringType ],
  [ String, StringType ],

  [ 'bool', BooleanType ],
  [ 'boolean', BooleanType ],
  [ Boolean, BooleanType ],

  [ 'number', NumberType ],
  [ Number, NumberType ],

  [ 'array', ArrayType ],
  [ 'arrayOf', ArrayType ],
  [ Array, ArrayType ],

  [ 'proptypes', ObjectType ],
  [ 'shape', ObjectType ],
  [ 'object', ObjectType ],
  [ 'objectOf', ObjectType ],
  [ Object, ObjectType ],

  [ 'oneOf', ValueType ],
  [ 'value', ValueType ],

  [ 'oneOfType', MultiType ],
  [ 'multi', MultiType ],
  [ 'multiple', MultiType ],

  // stock specific types
  [ 'symbol', Symbol ],
  [ 'func', Function ],
  [ 'function', Function ],
  [ 'set', Set ],
  [ 'map', Map ],

  // [ 'url', UrlType ],

  [ 'any', null ]
])

/******************************************************************************/
// Main
/******************************************************************************/

function resolveCompiler (type) {

  const typeMap = this || TYPE_MAP

  let output = type
  if (typeMap.has(output))
    output = typeMap.get(output)

  if (is.subclassOf(output, GenericType)) {
    const ExtendedType = output
    output = new ExtendedType()

  } else if (is.instanceable(output))
    output = new SpecificType(output)

  else if (output === null)
    output = new GenericType()

  if (!is(output, GenericType) && !is.func(output))
    throw new Error(`could not resolve type: ${inspect(type)}`)

  return output
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default resolveCompiler
