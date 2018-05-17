import StoreObserver from './observer'
import React from 'react'
/******************************************************************************/
// Main
/******************************************************************************/

function observe (Component, listen) {

  if (this !== undefined) {
    listen = Component
    Component = this
  }

  const Observed = props =>
    <StoreObserver listen={listen}>
      <Component {...props}/>
    </StoreObserver>

  return Observed
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default observe
