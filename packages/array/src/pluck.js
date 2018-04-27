
/******************************************************************************/
// Main
/******************************************************************************/

function pluck (arr, test, count = arr.length) {

  if (this !== undefined) {
    count = typeof test === 'number'
      ? test
      : this.length
    test = arr
    arr = this
  }

  const results = []
  const indexes = []

  const reverse = count < 0
  if (reverse)
    count = -count

  for (let i = reverse ? arr.length - 1 : 0;

    results.length < count && (reverse
      ? i >= 0
      : i < arr.length);

    i += reverse ? -1 : 1) {

    const value = arr[i]
    if (!test(value, i, arr))
      continue

    if (reverse)
      results.unshift(value)
    else
      results.push(value)

    if (reverse)
      indexes.push(i)
    else
      indexes.unshift(i)
  }

  for (const index of indexes)
    arr.splice(index, 1)

  return results
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default pluck
