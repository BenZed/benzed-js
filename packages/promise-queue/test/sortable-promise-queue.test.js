import { expect } from 'chai'
import PromiseQueue from '../../src'
import SortablePromiseQueue from '../../src'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Sortable Promise Queue', () => {

  describe('Setup', () => {

    it('is a class', () => {
      expect(SortablePromiseQueue).to.throw('cannot be invoked without \'new\'')
    })

    it('extends PromiseQueue', () => {
      const q = new SortablePromiseQueue(2)
      expect(q).to.be.instanceof(PromiseQueue)
    })

    it('takes a sorter function as second argument', () => {

      const sorter = () => {}

      const q = new SortablePromiseQueue(2, sorter)
      expect(q.sorter).to.be.equal(sorter)
    })

    it('throws if sorter is defined but not a function', () => {

      expect(() => new SortablePromiseQueue()).to.not.throw()

      expect(() => new SortablePromiseQueue(1, 0)).to.throw('must be a function')

    })

  })

  const dollars = (length = 5) => new Promise(resolve => {
    setTimeout(() => resolve('$'.repeat(length)), 25)
  })

  describe('Usage', () => {

    describe('add()', () => {

      it('now takes an order value that sorts items before being fired next', async () => {

        const queue = new SortablePromiseQueue(1)

        const five = queue.add(() => dollars(5), 5)
        const one = queue.add(() => dollars(1), 1)
        const two = queue.add(() => dollars(2), 2)
        const three = queue.add(() => dollars(3), 3)
        const four = queue.add(() => dollars(4), 4)

        const order = [ five, four, three, two, one ]

        for (let i = 5; i >= 2; i--) {
          expect(await Promise.race(order)).to.equal('$'.repeat(i))
          order.shift()
        }
      })

      it('order can also be a function', async function () {

        const queue = new SortablePromiseQueue(1)

        queue.add(() => dollars(3), () => 1)
        const two = queue.add(() => dollars(2), () => 2)
        const three = queue.add(() => dollars(3), () => 3)
        const four = queue.add(() => dollars(4), () => 4)
        const five = queue.add(() => dollars(5), () => 5)

        const order = [ five, four, three, two ]
        for (let i = 5; i >= 2; i--) {
          expect(await Promise.race(order)).to.equal('$'.repeat(i))
          order.shift()
        }
      })
    })
  })
})
