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
const MAX_CONCURRENT = Symbol('max-concurrent')

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

  static Item = PromiseQueueItem;

  [CURRENT] = [];
  [QUEUE] = [];

  [NEXT] = this::next;
  [DONE] = this::done;

  [MAX_CONCURRENT] = null

  constructor (maxConcurrent = 1) {

    if (typeof maxConcurrent !== 'number' || !isFinite(maxConcurrent) || maxConcurrent < 1)
      throw new Error('maxConcurrent, if defined, must be a number above zero.')

    this[MAX_CONCURRENT] = maxConcurrent

  }

  add (promiser, ...args) {

    if (typeof promiser !== 'function')
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

  get maxConcurrent () {
    return this[MAX_CONCURRENT]
  }

  get items () {

    const items = [ ...this[CURRENT], ...this[QUEUE] ]

    return items

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
