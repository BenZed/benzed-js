import Store from './store'

import { StoreProvider, StoreConsumer } from './context'
import StoreObserver from './observer'
import observe from './observe'

import task from './task'

/******************************************************************************/
// Extend
/******************************************************************************/

Store.observe = observe

/******************************************************************************/
// Exports
/******************************************************************************/

export default Store

export {
  Store,
  StoreProvider,
  StoreConsumer,
  StoreObserver,
  observe as observeStore,
  task
}
