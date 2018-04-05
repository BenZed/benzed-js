import PromiseQueue from './promise-queue'
import SortablePromiseQueue from './sortable-promise-queue'

/******************************************************************************/
// Extend
/******************************************************************************/

PromiseQueue.Sortable = SortablePromiseQueue

/******************************************************************************/
// Exports
/******************************************************************************/

export default PromiseQueue

export { PromiseQueue, SortablePromiseQueue }
