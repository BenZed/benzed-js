import { useRef, useEffect } from 'react'
import Delay from '../delay'

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
