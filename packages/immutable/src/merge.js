import copy from './copy'

/******************************************************************************/
// Helper
/******************************************************************************/

function mergeMutate (a, b) {

  const isAObject = typeof a === 'object' && a !== null
  const isBObject = typeof b === 'object' && b !== null

  if (!isAObject || !isBObject)
    return b

  for (const key in b)
    a[key] = mergeMutate(a[key], b[key])

  return a
}

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * merge - Description
 *
 * @param {type} a Description
 * @param {type} b Description
 *
 * @return {type} Description
 */
function merge (a, b) {

  if (this !== undefined) {
    b = a
    a = this
  }

  a = copy(a)
  b = copy(b)

  return mergeMutate(a, b)
}

/******************************************************************************/
// Exports
/******************************************************************************/

merge.mut = mergeMutate

export default merge
