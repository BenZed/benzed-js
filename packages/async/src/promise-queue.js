/******************************************************************************/
// What's this?
/******************************************************************************/

// As the title suggests, this class allows you to run promises sequentially,
// which is important for something like After Effects, because it can only
// handle one script at a time.

/******************************************************************************/
// Symbolic Property Keys
/******************************************************************************/

const $$queue = Symbol('queue')
const $$current = Symbol('current')
const $$max = Symbol('max-concurrent')

const $$next = Symbol('next')
const $$done = Symbol('done')

/******************************************************************************/
// Private Danglers
/******************************************************************************/

function next () {

  if (this.resolvingCount >= this.maxConcurrent)
    return

  const queue = this[$$queue]
  const current = this[$$current]
  const done = this[$$done]

  this.onNext(queue)

  const item = queue.shift()

  item.run(done)

  current.push(item)
}

function done (item) {

  const queue = this[$$queue]
  const current = this[$$current]
  const next = this[$$next]

  const index = current.indexOf(item)

  current.splice(index, 1)

  this.onDone(queue)
  // this.emit('done', queue)

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

  [$$current] = [];
  [$$queue] = [];

  [$$next] = this::next;
  [$$done] = this::done;

  [$$max] = null

  constructor (maxConcurrent = 1) {

    if (typeof maxConcurrent !== 'number' || !isFinite(maxConcurrent) || maxConcurrent < 1)
      throw new Error('maxConcurrent, if defined, must be a number above zero.')

    this[$$max] = maxConcurrent

  }

  add (promiser, ...args) {

    if (typeof promiser !== 'function')
      throw new Error('PromiseQueue.add() takes a function that returns a promise.')

    const { Item } = this.constructor

    const item = new Item(promiser, ...args)

    this[$$queue].push(item)
    this[$$next]()

    return item.complete
  }

  clear (err = 'Cancelled') {

    for (const item of this[$$queue])
      item.reject(new Error(err))

    this[$$queue].length = 0
  }

  get resolvingCount () {
    return this[$$current].length
  }

  get queuedCount () {
    return this[$$queue].length
  }

  get count () {
    return this.queuedCount + this.resolvingCount
  }

  get length () {
    return this.count
  }

  get maxConcurrent () {
    return this[$$max]
  }

  get items () {

    const items = [
      ...this[$$current],
      ...this[$$queue]
    ]

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
