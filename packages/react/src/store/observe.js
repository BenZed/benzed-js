import Observer from './observer'
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
    <Observer listen={listen}>
      <Component {...props}/>
    </Observer>

  return Observed
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default observe
