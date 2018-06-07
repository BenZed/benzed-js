import { expect } from 'chai'
import Store from './store'
import { get } from '@benzed/immutable'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Store', () => {

  it('is a class', () => {
    expect(Store).to.throw('cannot be invoked without \'new')
  })

  describe('usage', () => {

    let points
    let score
    before(() => {
      class PointStore extends Store {

        points = 0
        team = 'red'

        setPoints (value) {
          this.set('points', value)
        }

        changePoints (delta = 0) {
          this.setPoints(this.points + delta)
        }

        setTeam (name) {
          this.set('team', name)
        }

      }

      score = new PointStore()
      score.subscribe(state => { points = state.points })

    })

    it('is extended to create customizable state stores', () => {
      score.setPoints(100)
      expect(points).to.be.equal(100)
    })
  })

  describe('methods', () => {

    class MetaStore extends Store {
      data = { foo: 'bar', length: 100 }
      status = 'okay'
    }

    describe('set', () => {

      let meta
      before(() => {
        meta = new MetaStore()
      })

      it('does nothing is state is unchanged', () => {
        let notifications = 0

        meta.set('data', { foo: 'bar', length: 100 })
        meta.subscribe(() => notifications++)
        const data = meta.data
        meta.set('data', { foo: 'bar', length: 100 })

        expect(data).to.equal(data)
        expect(notifications).to.equal(0)
      })

      it('throws if first path key does not exist in state', () => {
        expect(() => meta.set('bad-key')).to.throw('Cannot set bad-key, bad-key is not a valid state property.')
        expect(() => meta.set(['bar', 'foo'])).to.throw('Cannot set bar.foo, bar is not a valid state property.')
      })

      it('notifies subscribers with state', () => {
        let _state

        meta.set('status', 'okay')
        meta.subscribe(state => { _state = state })
        meta.set('status', 'great')

        expect(_state.status).to.be.equal('great')
      })

      it('applies state to store before notifying', () => {

        let statusFromStore
        meta.set('status', 'red')
        meta.subscribe(() => {
          statusFromStore = meta.status
        })

        meta.set('status', 'green')

        expect(statusFromStore).to.equal('green')
      })

      it('sets values in state', () => {

        meta.set('status', 'okay')
        meta.set('status', 'amazing')

        expect(meta.status).to.equal('amazing')
      })

      it('new state is a copy', () => {
        meta.set(['data', 'length'], 100)
        meta.set('status', 'okay')

        let data = meta.data
        meta.set(['data', 'length'], 75)

        expect(meta.data).to.not.equal(data)

        data = meta.data
        meta.set('status', 'great')

        expect(meta.data).to.not.equal(data)
      })
    })

    describe('get', () => {

      let meta
      before(() => {
        meta = new MetaStore()
      })

      it('gets value from state', () => {
        expect(meta.get('status')).to.be.equal(meta.status)
      })

      it('gotten value is not copy', () => {
        expect(meta.get('data')).to.be.equal(meta.data)
      })
    })

    describe('copy', () => {

      let meta
      before(() => {
        meta = new MetaStore()
      })

      it('returns an object containing all of the data in a stores state keys', () => {
        expect(meta.copy()).to.deep.equal({
          data: { foo: 'bar', length: 100 },
          status: 'okay'
        })
      })

      it('returns copied values', () => {
        expect(meta.copy().data).to.not.equal(meta.data)
      })
    })

    describe('equals', () => {
      it('returns true of store state is value equal to input', () => {
        const meta = new MetaStore()
        const meta2 = new MetaStore()

        const state = meta.copy()

        expect(meta.equals(state)).to.be.equal(true)
        expect(meta.equals(meta2)).to.be.equal(true)

        meta2.set('status', 'bad')
        expect(meta.equals(meta2)).to.be.equal(false)
      })
    })

    describe('subscribe', () => {

      let meta
      before(() => {
        meta = new MetaStore()
      })

      it('submits a function to be called on state changes', () => {

        let _state

        meta.set('status', 'bad')
        meta.subscribe(state => { _state = state })
        meta.set('status', 'okay')

        expect(_state.status).to.equal('okay')
        expect(_state).to.deep.equal(meta.copy())
      })

      it('func argument must be a function', () => {
        expect(() => meta.subscribe(100)).to.throw('callback argument must be a function')
      })

      it('can also take a path, which squelches state calls unrelated to that path', () => {

        meta.set(['data', 'length'], 100)

        let length
        let calls = 0

        const lengthSub = (state, path) => {
          length = get.mut(state, path)
          calls++
        }

        meta.subscribe(lengthSub, ['data', 'length'])
        meta.set(['data', 'length'], 99)

        expect(calls).to.equal(1)
        expect(length).to.equal(99)

        meta.set('data', { foo: 'cake', length: 80 })
        expect(calls).to.equal(2)
        expect(length).to.equal(80)

        meta.set(['data', 'foo'], 'cheese')
        expect(calls).to.equal(2)
        expect(length).to.equal(80)

        meta.set('status', 'green')
        expect(calls).to.equal(2)
        expect(length).to.equal(80)
      })

      it('can provide multiple paths', () => {

        const paths = []
        const sub = (state, path) => paths.push(path)

        meta.subscribe(sub, ['data', 'foo'], 'status')
        meta.set(['data', 'foo'], 100)
        meta.set(['data', 'length', 10])
        meta.set(['status'], 'great')

        expect(paths).to.deep.equal([['data', 'foo'], ['status']])
      })

      it('paths must be strings, symbols or arrays thereof', () => {

        const sub = () => {}

        let badValues = [ 100, false, true, {} ]

        badValues = [ ...badValues, ...badValues.map(bv => [bv]) ]

        for (const badValue of badValues)
          expect(() => meta.subscribe(sub, badValue))
            .to.throw('paths must be arrays of strings or symbols')
      })
    })

    describe('unsubscribe', () => {

      it('removes subscribers', () => {
        const meta = new MetaStore()

        let calls = 0
        const setter = state => { calls++ }

        meta.subscribe(setter)
        meta.subscribe(setter)

        meta.set('status', 'red')
        expect(calls).to.equal(2)

        meta.unsubscribe(setter)
        meta.set('status', 'blue')
        expect(calls).to.equal(2)
      })

      it('func argument must be a function', () => {
        const meta = new MetaStore()

        expect(() => meta.unsubscribe(100)).to.throw('callback argument must be a function')
      })

    })
  })
})
