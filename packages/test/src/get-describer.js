
/******************************************************************************/
// TODO seperate to own file
/******************************************************************************/

/* global describe */

const SKIP = Symbol('skip')
const ONLY = Symbol('only')

function getDescriber (operator) {

  if (operator === SKIP)
    return (...args) => describe.skip(...args)

  if (operator === ONLY)
    return (...args) => describe.only(...args)

  return describe
}

/******************************************************************************/
// Extend
/******************************************************************************/

getDescriber.wrap = func => {
  func.skip = SKIP::func
  func.only = ONLY::func
  return func
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getDescriber
