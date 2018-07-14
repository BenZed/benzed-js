import isIterable from './is-iterable'
import { hasNumericLength } from './is-array-like'

/******************************************************************************/
// Helper
/******************************************************************************/

function pushValueIfUnique (result, value) {
  if (!result.includes(value))
    result.push(value)
}

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * create an array reduced to unique values
 *
 * @param  {Array|ArrayLike|Iterable} input Object to reduced
 * @return {Array}       array reduced to unique values
 */
function unique (input) {

  if (this !== undefined)
    input = this

  const result = []

  if (isIterable(input))
    for (const value of input)
      pushValueIfUnique(result, value)

  else if (hasNumericLength(input))
    for (let i = 0; i < input.length; i++)
      pushValueIfUnique(result, input[i])
  else
    throw new Error('unique must be called on iterables or array-like values.')

  return result

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default unique
