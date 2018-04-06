import React, { createContext } from 'react'

/******************************************************************************/
// Store Context
/******************************************************************************/

const StoreContext = createContext()

/******************************************************************************/
// Main Component
/******************************************************************************/

const StoreProvider = ({ children, ...stores }) =>

  <StoreContext.Provider value={stores} >
    { children }
  </StoreContext.Provider>

/******************************************************************************/
// Exports
/******************************************************************************/

export default StoreProvider

export { StoreContext as Context }
