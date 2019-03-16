
/******************************************************************************/
// Callback with data
/******************************************************************************/

function callbackWithData () {

  const delay = this

  delay.callback(delay.data)

}

/******************************************************************************/
// Main
/******************************************************************************/

class Delay {

  callback = null
  data = null

  time = null
  timerId = null

  constructor (callback, time = 1000, data = null) {
    this.callback = callback
    this.time = time
    this.data = data
  }

  invoke (data) {
    if (this.timerId !== null)
      this.cancel()

    if (data != null)
      this.data = data

    this.timerId = setTimeout(this::callbackWithData, this.time)
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
