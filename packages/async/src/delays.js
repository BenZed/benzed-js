
/******************************************************************************/
// Main
/******************************************************************************/

/**
 * seconds - Description
 *
 * @param {type} num Description
 *
 * @return {type} Description
 */
const seconds = num =>
  milliseconds(num * 1000)

/**
 * milliseconds - Description
 *
 * @param {type} num Description
 *
 * @return {type} Description
 */
const milliseconds = num =>
  new Promise(
    resolve => setTimeout(
      () => resolve(num),
      num
    )
  )

const asyncConditionTimeout = delay => new Promise(
  (resolve, reject) =>
    setTimeout(
      () => reject(
        new Error(`could not resolve async condition in ${delay}ms`)
      ),
      delay
    ))
/**
 * until - Description
 *
 * @param {object} [config={}] Description
 *
 * @return {type} Description
 */
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
    // TODO major bug: if the result is a promise that never resolves, it skips the
    // timeout
    if (result instanceof Promise) {
      const intervalStart = Date.now()

      result = await Promise.race([
        result,
        asyncConditionTimeout(intervalDelay)
      ])

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
