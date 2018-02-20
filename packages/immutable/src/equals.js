import { EQUALS } from './symbols'

/******************************************************************************/
// Data
/******************************************************************************/

const {
  getOwnPropertyNames,
  getOwnPropertySymbols
} = Object

/******************************************************************************/
// Helpers
/******************************************************************************/

function arraysEqual (a, b) {

  if (a.length !== b.length)
    return false

  for (let i = 0; i < a.length; i++)
    if (!equals(a[i], b[i]))
      return false

  return true
}

function namesAndSymbols (value) {

  const names = getOwnPropertyNames(value)
  const symbols = getOwnPropertySymbols(value)

  return names.concat(symbols)

}

/******************************************************************************/
// Main
/******************************************************************************/

function equals (...args) {

  let a, b

  if (args.length >= 2)
    ([ a, b ] = args)
  else {
    ([ b ] = args)
    a = this
  }

  if (Number.isNaN(a))
    return Number.isNaN(b)

  if (a === null)
    return b === null

  if (typeof a !== 'object' || typeof b !== 'object')
    return a === b

  if (typeof a[EQUALS] === 'function')
    return a[EQUALS](b)

  if (typeof b[EQUALS] === 'function')
    return b[EQUALS](a)

  if (typeof a.equals === 'function')
    return a.equals(b)

  if (typeof b.equals === 'function')
    return b.equals(a)

  if (a instanceof Array && b instanceof Array)
    return arraysEqual(a, b)

  const akeys = namesAndSymbols(a)
  const bkeys = namesAndSymbols(a)

  if (akeys.length !== bkeys.length)
    return false

  for (const key of akeys)
    if (!equals(a[key], b[key]))
      return false

  return true
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default equals
