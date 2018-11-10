import { $$equals } from './symbols'

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

/**
 * Compares value equality of two inputs.
 *
 * Two operands are considered value equal if they:
 *
 * - Are equal primitives.
 *
 * - Are both NaN.
 *
 * - Implement symbolic $$equals or string 'equals' method, which returns
 * true when given the opposing operand as input.
 *
 * - Are both objects with value equal string and symbolic keys.
 *
 * - Are both arrays with order and value equal items.
 *
 * - Are reference equal.
 *
 * @param  {*} a Left hand operand.
 * @param  {*} b Right hand operand.
 * @return {boolean} True if two elements are value equal, false if not.
 */
function equals (a, b) {

  if (this !== undefined) {
    b = a
    a = this
  }

  if (a === b)
    return true

  const aType = typeof a
  const bType = typeof b

  const aIsFunc = aType === 'function'
  const bIsFunc = bType === 'function'

  const aIsObject = aIsFunc || (aType === 'object' && a !== null)
  const bIsObject = bIsFunc || (bType === 'object' && b !== null)

  if (aIsObject && typeof a[$$equals] === 'function')
    return a[$$equals](b)

  if (bIsObject && typeof b[$$equals] === 'function')
    return b[$$equals](a)

  if (aIsObject && typeof a.equals === 'function')
    return a.equals(b)

  if (bIsObject && typeof b.equals === 'function')
    return b.equals(a)

  if (Number.isNaN(a))
    return Number.isNaN(b)

  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime()

  if ((aIsFunc && bIsFunc) || aIsFunc !== bIsFunc)
    return false

  if (!aIsObject || !bIsObject)
    return false

  if (Array.isArray(a) && Array.isArray(b))
    return arraysEqual(a, b)

  if (typeof a[Symbol.iterator] === 'function' &&
      typeof b[Symbol.iterator] === 'function')
    return arraysEqual([ ...a ], [ ...b ])

  const akeys = namesAndSymbols(a)
  const bkeys = namesAndSymbols(b)

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
