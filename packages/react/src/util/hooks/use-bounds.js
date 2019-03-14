import { useRef, useState, useLayoutEffect } from 'react'

/******************************************************************************/
// Helper
/******************************************************************************/

const createBounds = domRef => {

  // doCalc must be true, otherwise getBoundingClientRect will be called anytime
  // useBounds is
  const bounds = domRef
    .current
    .getBoundingClientRect()
    .toJSON()

  return addHiddenRef(bounds, domRef)
}

const addHiddenRef = (obj, domRef) =>
  Object.defineProperty(obj, 'ref', { value: domRef })

/******************************************************************************/
// Main
/******************************************************************************/

const useBounds = (domRef = useRef()) => {

  const [ bounds, setBounds ] = useState(addHiddenRef({}, domRef))

  useLayoutEffect(() => {

    const updateBounds = () => setBounds(createBounds(domRef, true))

    const resizeObserver = new ResizeObserver(updateBounds)
    resizeObserver.observe(domRef.current)

    updateBounds()

    return () => {
      resizeObserver.disconnect()
    }

  }, [ domRef.current ])

  return bounds
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default useBounds
