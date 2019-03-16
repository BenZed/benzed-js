import { useEffect } from 'react'
import useInstance from './use-instance'
import Delay from '../delay'

/******************************************************************************/
// Main
/******************************************************************************/

const useDelay = (callback, time, data) => {

  const delay = useInstance(Delay, callback, time)
  if (delay.callback !== callback)
    delay.callback = callback // typically this would happen every time this function is run

  if (delay.time !== time)
    delay.time = time

  useEffect(() => () => delay?.cancel(), [])

  return delay
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default useDelay
