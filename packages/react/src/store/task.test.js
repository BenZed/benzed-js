import is from 'is-explicit'
import { expect } from 'chai'

import task, { TASK, Task } from './task'
import Store from './store'

import { milliseconds } from '@benzed/async'
import { equals, COPY } from '@benzed/immutable'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('@task decorator', () => {

  it('is a function', () => {
    expect(task).to.be.instanceof(Function)
  })

  let TrafficStore
  before(() => {
    TrafficStore = class extends Store {

      light = 'green'

      @task
      next () {

        let light = this.get('light')
        light = light === 'green'
          ? 'yellow'
          : light === 'yellow'
            ? 'red'
            : light === 'red'
              ? 'green'
              : null

        if (light === null)
          throw new Error('The light has been damaged.')

        this.set('light', light)
      }

      reset () {
        this.next.status = 'idle'
        this.next.progress = 0
        this.next.error = null
        this.light = 'green'
      }
    }

  })

  describe('decorates store actions', () => {

    it('throws if decorated property is not a function', () => {
      expect(() =>
        class extends Store {
          @task
          property = 'foobar'
        }
      ).to.throw('@task decorator must be called on a class method.')
    })

    it('throws if decorated property is not on a store class', () => {
      expect(() => {
        return {
          @task
          method () { console.log('method called') }
        }
      }).to.throw('@task decorator must be called on a subclass of Store')
    })

    it('adds TASK symbol to class prototype methods', () => {
      expect(TrafficStore.prototype.next).to.have.property(TASK, Task)
    })

    it('ensures class prototype methods are enumerable', () => {
      const descriptor = Object.getOwnPropertyDescriptor(TrafficStore.prototype, 'next')
      expect(descriptor).to.have.property('enumerable', true)
    })

    it('methods with TASK symbols are instanced as Tasks on Store construction', () => {
      const traffic = new TrafficStore()
      expect(traffic.next).to.have.property(TASK)
      expect(traffic.next[TASK]).to.be.instanceof(Task)
    })

    describe('Task method wrapper', () => {

      let traffic
      before(() => {
        traffic = new TrafficStore()
      })

      describe('returns action bound to task', () => {

        it('is returned when calling new Task', () => {
          const traffic = new TrafficStore()
          expect(traffic.next).to.be.instanceof(Function)
          expect(traffic.next).to.not.be.equal(TrafficStore.prototype.next)
        })

        it('runs wrapped method', async () => {
          traffic.reset()
          await traffic.next()
          expect(traffic.light).to.be.equal('yellow')
        })

      })
      describe('execute context', () => {

        let TestStore, test
        before(() => {
          TestStore = class extends Store {

            data = {}

            temp = null

            @task
            _set (value) {
              this.set(['data', 'foo'], value)
            }

            @task
            _get () {
              this.store.temp = this.get(['data', 'foo'])
            }

            @task
            _status (value) {
              this.status(value)
              this.store.temp = this.store._status.status
            }

            @task
            _progress (value) {
              this.progress(value)
              this.store.temp = this.store._progress.progress
            }

            @task
            _error (value) {
              this.error(value)
              this.store.temp = this.store._error.error
            }
          }

          test = new TestStore()
        })

        describe('.set', () => {
          it('shortcut to .set in store', async () => {
            await test._set('bar')
            expect(test.data.foo).to.equal('bar')
          })
        })
        describe('.get', () => {
          it('shortcut to .get in store', async () => {
            await test._set('bar')
            await test._get()
            expect(test.temp).to.equal('bar')
          })
        })
        describe('.status', () => {
          it('sets execute.status property', async () => {
            await test._status('danger')
            expect(test.temp).to.equal('danger')
          })
          it('notifies subscribers', async () => {
            const statuses = []
            const setStatus = () => {
              statuses.push(test._status.status)
            }
            test.subscribe(setStatus, ['_status', 'status'])
            await test._status('active')
            expect(statuses).to.be.deep.equal(['active'])
          })
        })

      })
    })
  })

  describe('store alterations', () => {

    it('store setting a task property direct will fail', () => {
      const traffic = new TrafficStore()
      expect(() => traffic.set('next', {})).to.throw('Cannot assign to read only property \'next\'')
      expect(traffic.next).to.not.deep.equal({})
    })

    it('store equality test accounts for task properties', async () => {
      const traffic = new TrafficStore()
      const traffic2 = new TrafficStore()

      expect(equals(traffic, traffic2)).to.be.equal(true)

      await traffic.next()
      expect(equals(traffic, traffic2)).to.not.be.equal(true)

      await traffic2.next()
      expect(equals(traffic, traffic2)).to.be.equal(true)

      traffic2.next.status = 'maintenance'
      expect(equals(traffic, traffic2)).to.be.equal(false)

      traffic.next.status = 'maintenance'
      expect(equals(traffic, traffic2)).to.be.equal(true)
    })

    it('store copies tasks as plain objects', () => {
      const traffic = new TrafficStore()
      const state = traffic[COPY]()

      expect(is.plainObject(state.next)).to.be.equal(true)
      expect(state.next.status).to.be.equal(traffic.next.status)
      expect(state.next.progress).to.be.equal(traffic.next.progress)
      expect(state.next.error).to.be.equal(traffic.next.error)
    })
  })

})
