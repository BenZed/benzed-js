import React, { createContext } from 'react'
import { PropTypeSchema, string, func, required } from '@benzed/schema'
import StoreObserver from './observer'

/******************************************************************************/
// Store Context
/******************************************************************************/

const StoreContext = createContext()

/******************************************************************************/
// Main Component
/******************************************************************************/

// eslint-disable-next-line react/prop-types
const StoreProvider = ({ children, ...stores }) =>
  <StoreContext.Provider value={stores} >
    { children }
  </StoreContext.Provider>

const StoreConsumer = ({ children, store: name, ...props }) =>
  <StoreContext>{stores =>
    name in stores

      ? <StoreObserver store={stores[name]} {...props}>
        {children}
      </StoreObserver>

      : throw new Error(`${name} is not a recognized provided store.`)

  }</StoreContext>

StoreConsumer.propTypes = {
  store: string(required),
  children: func(required)
}

StoreConsumer.propTypes = StoreConsumer.propTypes::PropTypeSchema()

/******************************************************************************/
// Exports
/******************************************************************************/

export { StoreProvider, StoreContext, StoreConsumer }
