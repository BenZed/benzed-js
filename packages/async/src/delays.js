
/******************************************************************************/
// Main
/******************************************************************************/

function seconds (num) {

  return milliseconds(num * 1000)

}

function milliseconds (num) {

  return new Promise(resolve => setTimeout(() => resolve(num), num))

}

async function until (config = {}) {

  if (typeof config === 'function')
    config = { condition: config }

  const {
    condition,
    timeout = Infinity,
    interval = 25,
    err = `condition could not be met in ${timeout} ms`
  } = config

  if (typeof condition !== 'function')
    throw new Error('condition must be a function')

  const start = Date.now()
  let delta = 0

  while (!condition(delta)) {
    await milliseconds(interval)

    delta = Date.now() - start
    if (delta >= timeout)
      throw new Error(err)
  }

  return delta
}

/******************************************************************************/
// Exports
/******************************************************************************/

export { until, seconds, milliseconds }
