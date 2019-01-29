import is from 'is-explicit'
import { wrap } from '@benzed/array'

// TODO move me to util

/******************************************************************************/
// Data
/******************************************************************************/

const PATH_TYPES = [ String, Number, Symbol ]

/******************************************************************************/
// IsPathType
/******************************************************************************/

const isPathType = value => is(value, PATH_TYPES) || is.arrayOf(value, PATH_TYPES)

/******************************************************************************/
// Main
/******************************************************************************/

const isArrayOfPaths = input => input.length === 0 || input.every(isPathType)

const normalizePaths = input => input.length > 0 && isArrayOfPaths(input)
  ? input.map(wrap)
  : [[]]

/******************************************************************************/
// Exports
/******************************************************************************/

export default isArrayOfPaths

export {
  isArrayOfPaths,
  normalizePaths
}
