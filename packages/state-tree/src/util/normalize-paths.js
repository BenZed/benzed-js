import { wrap } from '@benzed/array'

import isArrayOfPaths from './is-array-of-paths'

/******************************************************************************/
// Main
/******************************************************************************/

const normalizePaths = input => input.length > 0 && isArrayOfPaths(input)
  ? input.map(wrap)
  : [[]]

/******************************************************************************/
// Exports
/******************************************************************************/

export default normalizePaths
