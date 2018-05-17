import PromiseQueue from './promise-queue'
import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

class SortablePromiseQueueItem extends PromiseQueue.Item {

  constructor (promiser, order) {
    super(promiser)

    const isFunc = is.func(order)
    if (!isFunc && !is.number(order))
      throw new Error('either a number or function that returns a number must be provided for an item\'s order value')

    this.order = isFunc ? order : () => order
  }

}

function descending (a, b) {
  return a < b ? 1 : a > b ? -1 : 0
}

/******************************************************************************/
// Main
/******************************************************************************/

class SortablePromiseQueue extends PromiseQueue {

  static Item = SortablePromiseQueueItem

  constructor (maxConcurrent, sorter = descending) {
    super(maxConcurrent)

    if (is.func(sorter) && !is.defined(sorter))
      throw new Error('sorter, if defined, must be a function')

    this.sorter = sorter
  }

  onNext (queue) {
    queue.sort((a, b) => {

      const aOrder = is.func(a.order) ? a.order() : a.order
      const bOrder = is.func(b.order) ? b.order() : b.order

      return this.sorter(aOrder, bOrder)
    })
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default SortablePromiseQueue
