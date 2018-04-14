import is from 'is-explicit'
import { copy } from '@benzed/immutable'

/******************************************************************************/
// Main
/******************************************************************************/

function normalize (definition) {

  if (!is.plainObject(definition) && !is(definition, Array))
    throw new Error('definition must be a plain object or array')

  definition = copy(definition)

  return definition
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default normalize
