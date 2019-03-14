import { useRef } from 'react'

/******************************************************************************/
// Date
/******************************************************************************/

const $$nyi = Symbol('not-yet-instanced')

/******************************************************************************/
//  TODO move me? test me?
/******************************************************************************/

const useInstance = (Type = Object, ...args) => {

  const instanceRef = useRef($$nyi)
  if (instanceRef.current === $$nyi)
    instanceRef.current = new Type(...args)

  return instanceRef.current
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default useInstance
