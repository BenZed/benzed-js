
/******************************************************************************/
// Main
/******************************************************************************/

const seconds = num =>
  milliseconds(num * 1000)

const milliseconds = num =>
  new Promise(
    resolve => setTimeout(
      () => resolve(num),
      num
    )
  )

async function until (config = {}) {

  if (typeof config === 'function')
    config = { condition: config }

  const {
    condition,
    timeout = Infinity,
    interval: intervalDelay = 25,
    err = `condition could not be met in ${timeout} ms`
  } = config

  if (typeof condition !== 'function')
    throw new Error('condition must be a function')

  const totalStart = Date.now()
  let totalDelta = 0

  while (true) {

    let intervalDelta = 0

    let result = condition(totalDelta)
    if (result instanceof Promise) {
      const intervalStart = Date.now()
      result = await result
      intervalDelta = Date.now() - intervalStart
    }

    const remainingIntervalDelay = intervalDelay - intervalDelta
    if (!result && remainingIntervalDelay > 0)
      await milliseconds(remainingIntervalDelay)

    totalDelta = Date.now() - totalStart
    if (totalDelta >= timeout)
      throw new Error(err)

    if (result)
      break
  }

  return totalDelta
}

/******************************************************************************/
// Exports
/******************************************************************************/

export { until, seconds, milliseconds }
