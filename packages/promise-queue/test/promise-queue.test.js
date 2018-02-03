import { expect } from 'chai'
import PromiseQueue from '../../src/modules/promise-queue'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Promise Queue', () => {

  describe('Setup', () => {

    it('is a class', () => {
      expect(PromiseQueue).to.throw('cannot be invoked without \'new\'')
    })

    it('maxConcurrent as first argument', () => {
      const q = new PromiseQueue(2)
      expect(q.maxConcurrent).to.be.equal(2)
    })

    it('maxConcurrent must be a number above zero', () => {
      for (const badValue of [0, -1, -Infinity, NaN, 'number', true, false])
        expect(() => new PromiseQueue(badValue)).to.throw('must be a number above zero')
    })

  })

  let num = 0
  function count (t = 100) {
    const result = ++num
    return new Promise(resolve => setTimeout(() => resolve(result), t))
  }

  afterEach(() => { num = 0 })

  describe('Usage', () => {

    describe('add()', () => {

      it('requires a promiser function', () => {
        const counter = new PromiseQueue(1)
        expect(() => counter.add(null)).to.throw('takes a function that returns a promise')
      })

      it('takes functions that return promises and executes them consecutively', async () => {
        const counter = new PromiseQueue(1)

        const one = counter.add(() => count(100))
        const two = counter.add(() => count(50))

        const result = await Promise.race([one, two])

        // promise 'one' should finish first even though it was configured to take
        // less time
        expect(result).to.be.equal(1)
      })

      it('returns promises that resolve when given function is complete', async () => {
        const counter = new PromiseQueue(1)

        const one = await counter.add(() => count(100))
        const two = await counter.add(() => count(50))

        expect(one).to.equal(1)
        expect(two).to.equal(2)

      })

      it('maxConcurrent allows multple promises to be executed concurrently', async () => {
        const counter = new PromiseQueue(2)

        const delay = 50

        const start = Date.now()
        const one = counter.add(() => count(delay))
        const two = counter.add(() => count(delay))

        await Promise.all([one, two])

        const end = Date.now() - start

        // If they weren't concurrent, end would be equal or above delay * 2
        expect(end).to.be.below(delay * 2)

      })

    })

    describe('clear()', () => {

      it('Rejects promises waiting in queue', () => {

        const counter = new PromiseQueue(1)

        const one = counter.add(count)
        const two = counter.add(count)

        expect(counter.queuedCount).to.equal(1)

        counter.clear()

        expect(one).to.eventually.equal(1)
        expect(counter.queuedCount).to.equal(0)

        return expect(two).to.eventually.be.rejectedWith('Cancelled')

      })

      it('Optionally takes a custom error message', () => {

        const counter = new PromiseQueue(1)
        const one = counter.add(count)
        const two = counter.add(count)

        counter.clear('Terminated')
        expect(one).to.eventually.equal(1)
        return expect(two).to.eventually.be.rejectedWith('Terminated')

      })

    })

    describe('onNext() hook', () => {

      it('fires when next item in queue is run', async () => {
        const queue = new PromiseQueue(1)

        let nexts = 0
        queue.onNext = () => { nexts++ }
        await queue.add(() => count())
        await queue.add(() => count())

        expect(nexts).to.equal(2)

      })

      it('receives raw item queue array', () => {
        const queue = new PromiseQueue(1)

        let arr = null
        queue.onNext = _arr => { arr = _arr }
        queue.add(() => count())
        queue.add(() => count())

        expect(arr).to.be.instanceof(Array)
        expect(arr).to.have.length(1)
      })
    })

    describe('onDone() hook', () => {

      it('fires when item in queue is complete', async () => {
        const queue = new PromiseQueue(1)

        let dones = 0
        queue.onDone = () => { dones++ }
        await queue.add(() => count())
        await queue.add(() => count())

        expect(dones).to.equal(2)

      })

      it('receives raw item queue array', async () => {
        const queue = new PromiseQueue(1)

        let arr = null
        queue.onDone = _arr => { arr = _arr }
        await queue.add(() => count())
        await queue.add(() => count())

        expect(arr).to.be.instanceof(Array)
        expect(arr).to.have.length(0)
      })
    })
  })
})
