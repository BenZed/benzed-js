import Observer from './Observer'
import React from 'react'

/******************************************************************************/
// Main
/******************************************************************************/

function observe (Component, config) {

  if (this !== undefined) {
    config = Component
    Component = this
  }

  const Observed = props =>
    <Observer config={config}>
      <Component {...props}/>
    </Observer>

  return Observed
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default observe
