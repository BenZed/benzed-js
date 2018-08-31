import Store from './store'

import { StoreProvider, StoreContext, StoreConsumer } from './context'
import StoreObserver from './observer'

import task from './task'

/******************************************************************************/
// Exports
/******************************************************************************/

export default Store

export {
  Store,
  StoreProvider,
  StoreConsumer,
  StoreObserver,
  StoreContext,
  task
}
