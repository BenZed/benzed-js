import PromiseQueue from './promise-queue'
import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

class SortablePromiseQueueItem extends PromiseQueue.Item {

  constructor (promiser, order) {
    super(promiser)

    const isFunc = is(order, Function)
    if (!isFunc && !is(order, Number))
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

    if (is(sorter) && !is(sorter, Function))
      throw new Error('sorter, if defined, must be a function')

    this.sorter = sorter
  }

  onNext (queue) {
    queue.sort((a, b) => {

      const aOrder = is(a.order, Function) ? a.order() : a.order
      const bOrder = is(b.order, Function) ? b.order() : b.order

      return this.sorter(aOrder, bOrder)
    })
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default SortablePromiseQueue
