import React, { createContext, useContext } from 'react'
import StateTreeObserver from './observer'

import { createPropTypesFor } from '@benzed/schema'

/******************************************************************************/
// Store Context
/******************************************************************************/

const StateTreeContext = createContext()

/******************************************************************************/
// Main Component
/******************************************************************************/

// eslint-disable-next-line react/prop-types
const StateTreeProvider = ({ children, tree }) =>
  <StateTreeContext.Provider value={tree} >
    { children }
  </StateTreeContext.Provider>

const StateTreeConsumer = StateTreeContext.Consumer

const StateTreeListener = ({ children, ...props }) => {

  const tree = useContext(StateTreeContext)

  return <StateTreeObserver {...props} tree={tree} >
    {children}
  </StateTreeObserver>
}

/******************************************************************************/
// Prop Types
/******************************************************************************/

StateTreeListener.propTypes = createPropTypesFor(React => <proptypes>
  <func key='children' required />
</proptypes>)

/******************************************************************************/
// Exports
/******************************************************************************/

export {
  StateTreeProvider,
  StateTreeConsumer,
  StateTreeListener
}
