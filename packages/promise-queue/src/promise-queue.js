import is from 'is-explicit'
import define from 'define-utility'

/******************************************************************************/
// What's this?
/******************************************************************************/

// As the title suggests, this class allows you to run promises sequentially,
// which is important for something like After Effects, because it can only
// handle one script at a time.

/******************************************************************************/
// Symbolic Property Keys
/******************************************************************************/

const QUEUE = Symbol('queue')
const CURRENT = Symbol('current')

const NEXT = Symbol('next')
const DONE = Symbol('done')

/******************************************************************************/
// Private Danglers
/******************************************************************************/

function next () {

  if (this.resolvingCount >= this.maxConcurrent)
    return

  const queue = this[QUEUE]
  const current = this[CURRENT]
  const done = this[DONE]

  this.onNext(queue)

  const item = queue.shift()

  item.run(done)

  current.push(item)

}

function done (item) {

  const queue = this[QUEUE]
  const current = this[CURRENT]
  const next = this[NEXT]

  const index = current.indexOf(item)

  current.splice(index, 1)

  this.onDone(queue)

  if (queue.length > 0)
    next()

}

/******************************************************************************/
// PromiseQueueItem
/******************************************************************************/

class PromiseQueueItem {

  constructor (promiser) {
    this.promiser = promiser
    this.complete = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  async run (done) {

    try {
      const results = await this.promiser()
      this.resolve(results)

    } catch (err) {
      this.reject(err)
    }

    done(this)
  }

}

/******************************************************************************/
// PromiseQueue export
/******************************************************************************/

class PromiseQueue {

  static Item = PromiseQueueItem

  constructor (maxConcurrent = 1) {

    if (!is(maxConcurrent, Number) || maxConcurrent < 1)
      throw new Error('maxConcurrent, if defined, must be a number above zero.')

    define(this)
      .const('maxConcurrent', maxConcurrent)
      .const(CURRENT, [])
      .const(QUEUE, [])
      .const(NEXT, this::next)
      .const(DONE, this::done)

  }

  add (promiser, ...args) {

    if (!is(promiser, Function))
      throw new Error('PromiseQueue.add() takes a function that returns a promise.')

    const { Item } = this.constructor

    const item = new Item(promiser, ...args)

    this[QUEUE].push(item)
    this[NEXT]()

    return item.complete

  }

  clear (err = 'Cancelled') {

    for (const item of this[QUEUE])
      item.reject(new Error(err))

    this[QUEUE].length = 0
  }

  get resolvingCount () {
    return this[CURRENT].length
  }

  get queuedCount () {
    return this[QUEUE].length
  }

  get length () {
    return this.queuedCount + this.resolvingCount
  }

  get count () {
    return this.length
  }

  get items () {

    const items = [ ...this[CURRENT], ...this[QUEUE] ]

    return items.map(item => item.complete)

  }

  // Hooks

  onNext () { }

  onDone () { }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default PromiseQueue

export { PromiseQueue, PromiseQueueItem }
