
const $$skip = Symbol('skip')
const $$only = Symbol('only')

function getDescriber (operator, name = 'describe') {

  const func = global[name]

  if (operator === $$skip)
    return (...args) => func.skip(...args)

  if (operator === $$only)
    return (...args) => func.only(...args)

  return func
}

/******************************************************************************/
// Extend
/******************************************************************************/

getDescriber.wrap = func => {
  func.skip = $$skip::func
  func.only = $$only::func
  return func
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getDescriber
