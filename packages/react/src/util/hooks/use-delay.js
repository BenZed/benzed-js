import { useRef, useEffect } from 'react'

/******************************************************************************/
// Helper Class
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
    if (this.id !== null)
      this.cancel()
    this.id = setTimeout(this.callback, this.delay)
  }

  cancel () {
    if (this.id !== null)
      clearTimeout(this.id)
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

const useDelay = (callback, delay) => {

  const delayRef = useRef()

  useEffect(() => {

    delayRef.current = new Delay(callback, delay)

    return () => {
      delayRef.current.cancel()
    }
  }, [ callback, delay ])

  return delayRef.current
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default useDelay
