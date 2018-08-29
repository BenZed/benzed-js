import React from 'react'

import StoreObserver from './observer'
import Store from './store'

import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function observe (Component, listen) {

  if (this !== undefined && !is.subclassOf(this, Store)) {
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
