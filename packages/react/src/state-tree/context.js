import React, { createContext } from 'react'
import { createPropTypesFor } from '@benzed/schema'
import StateTreeObserver from './observer'

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

const StateTreeConsumer = ({ children, ...props }) =>
  <StateTreeContext.Consumer>{tree =>

    <StateTreeObserver {...props} tree={tree} >
      {children}
    </StateTreeObserver>

  }</StateTreeContext.Consumer>

/******************************************************************************/
// Prop Types
/******************************************************************************/

StateTreeConsumer.propTypes = createPropTypesFor(React => <proptypes>
  <func key='children' required />
</proptypes>)

/******************************************************************************/
// Exports
/******************************************************************************/

export { StateTreeProvider, StateTreeContext, StateTreeConsumer }
