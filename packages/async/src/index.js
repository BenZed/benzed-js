import PromiseQueue from './promise-queue'
import SortablePromiseQueue from './sortable-promise-queue'

import { until, seconds, milliseconds } from './delays'

/******************************************************************************/
// Extend
/******************************************************************************/

PromiseQueue.Sortable = SortablePromiseQueue

/******************************************************************************/
// Exports
/******************************************************************************/

export {

  PromiseQueue, SortablePromiseQueue,

  seconds, milliseconds, until

}
