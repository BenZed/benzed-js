
/******************************************************************************/
// Main
/******************************************************************************/

function seconds (num) {

  return milliseconds(num * 1000)

}

function milliseconds (num) {

  return new Promise(resolve => setTimeout(() => resolve(num), num))

}

async function until (config) {

  if (typeof config === 'function')
    config = { condition: config }

  const {
    condition,
    timeout = Infinity,
    interval = 50,
    err = `condition could not be met in ${timeout} ms`
  } = config

  if (typeof condition !== 'function')
    throw new Error('condition must be a function')

  let ms = 0
  while (!condition()) {
    ms += await milliseconds(interval)
    if (ms >= timeout)
      throw new Error(err)
  }

  return ms
}

/******************************************************************************/
// Exports
/******************************************************************************/

export { until, seconds, milliseconds }
