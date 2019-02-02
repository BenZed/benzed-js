import { wrap, first } from '@benzed/array'
import is from 'is-explicit'

import { inspect } from 'util'

import { $$internal } from './symbols'
// TODO move me to util

/******************************************************************************/
// Data
/******************************************************************************/

const isPathType = [ String, Number, Symbol ]::is

/******************************************************************************/
// Main
/******************************************************************************/

const validatePath = (path, tree) => {

  path = wrap(path).filter(is.defined)

  const anyPath = path.length === 0
  if (!anyPath && !path.every(isPathType))
    throw new Error('Paths can only consist of Symbols, Numbers or Strings.')

  const stateKeys = !anyPath && tree?.constructor?.[$$internal]?.stateKeys

  if (stateKeys && stateKeys.length > 0 && !stateKeys.includes(first(path)))
    throw new Error(`${inspect(first(path))} is not a valid state key.`)

  return path
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default validatePath
