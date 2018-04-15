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

function equals (a, b) {

  if (this !== undefined) {
    b = a
    a = this
  }

  if (a === b)
    return true

  const aIsObject = typeof a === 'object' && a !== null
  const bIsObject = typeof b === 'object' && b !== null

  if (aIsObject && typeof a[EQUALS] === 'function')
    return a[EQUALS](b)

  if (bIsObject && typeof b[EQUALS] === 'function')
    return b[EQUALS](a)

  if (aIsObject && typeof a.equals === 'function')
    return a.equals(b)

  if (bIsObject && typeof b.equals === 'function')
    return b.equals(a)

  if (Number.isNaN(a))
    return Number.isNaN(b)

  if (!aIsObject || !bIsObject)
    return false

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
