
const SKIP = Symbol('skip')
const ONLY = Symbol('only')

function getDescriber (operator, name = 'describe') {

  const func = global[name]

  if (operator === SKIP)
    return (...args) => func.skip(...args)

  if (operator === ONLY)
    return (...args) => func.only(...args)

  return func
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
