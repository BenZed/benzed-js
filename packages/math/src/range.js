import { abs } from './overrides'

/******************************************************************************/
// Main
/******************************************************************************/

function * range (from, to, step) {

  if (typeof this === 'number') {
    step = to
    to = from
    from = this
  }

  step = step === undefined
    ? 1
    : abs(step)

  const ascending = to > from
  const delta = ascending ? step : -step

  for (let i = from; ascending ? i <= to : i >= to; i += delta)
    yield i
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default range
