
/******************************************************************************/
// Main
/******************************************************************************/

class Delay {

  timerId = null

  callback = null
  delay = null

  constructor (callback, delay = 1000) {
    this.callback = callback
    this.delay = delay
  }

  invoke () {
    if (this.timerId !== null)
      this.cancel()
    this.timerId = setTimeout(this.callback, this.delay)
  }

  cancel () {
    if (this.timerId !== null)
      clearTimeout(this.timerId)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Delay
