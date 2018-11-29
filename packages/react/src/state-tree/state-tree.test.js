import { expect } from 'chai'
import { copy } from '@benzed/immutable'
import { clamp } from '@benzed/math'

import StateTree, { $$state } from './state-tree'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const CounterStateTree = () =>
  new StateTree({
    count: 0
  }, {
    increment () {
      const [ count, setCount ] = this('count')
      setCount(count + 1)
    },

    decrement () {
      const { value, set } = this('count')
      set(value - 1)
    }
  })

const ScoreStateTree = () =>
  new StateTree({
    scores: [],
    average: 0
  }, {

    addScore (amount) {

      const { set: setScore } = this('scores')
      const { set: setAverage } = this('average')

      setScore([ ...this.scores, amount ])

      const value = this
        .scores
        .reduce((a, v) => a + v) / this.scores.length

      setAverage(value)
    }
  })

describe.only('StateTree', () => {

  it('is a function', () => {
    expect(StateTree).to.be.instanceof(Function)
  })

  it('takes an state object and actions object', () => {
    expect(() => new StateTree({}, {}))
      .to.not.throw(Error)

    expect(() => new StateTree('word'))
      .to.throw('initial state must be a plain object.')

    expect(() => new StateTree({}, 'my bird'))
      .to.throw('actions must be a plain object.')
  })

  it('actions object may only have functions', () => {
    expect(() => new StateTree({}, { foo: 'bar', cake: { town: true } }))
      .to.throw(`actions.foo is not a function`)
  })

  describe('state management', () => {

    let counter
    before(() => {
      counter = CounterStateTree()
    })

    it('state and actions are created from initial object', () => {
      expect(counter.count).to.be.equal(0)
    })

    it('actions are bound to value set and change', () => {
      expect(counter.increment).to.be.instanceof(Function)
    })

    it('state is applied to tree on action invocation', () => {
      let count = counter.count
      counter.increment()
      expect(counter.count).to.be.equal(count + 1)

      count = counter.count
      counter.decrement()
      expect(counter.count).to.be.equal(count - 1)
    })

    it('state setters are reused for identical paths', () => {
      const setter1 = counter()[1]
      const setter2 = counter()[1]

      const setCount1 = counter('count')[1]
      const setCount2 = counter('count')[1]

      expect(setter1).to.be.equal(setter2)
      expect(setCount1).to.be.equal(setCount2)
    })

  })

  describe('toJSON', () => {

    let counter
    let state
    before(() => {
      counter = CounterStateTree()
      state = counter.toJSON()
    })

    it('returns state', () => {
      expect(state).to.be.deep.equal(counter[$$state])
    })
    it('returned is a copy', () => {
      expect(state).to.not.be.equal(counter[$$state])
    })
  })

  describe('subscriptions', () => {

    describe('stateTree.subscribe', () => {

      let counter
      let tree
      let path
      before(() => {
        counter = CounterStateTree()
        counter.subscribe((...args) => { [ tree, path ] = args })
        counter.increment()
      })

      it('allows a function to be called when state changes', () => {
        expect(tree).to.not.be.equal(undefined)
      })

      it('function receives tree as first argument', () => {
        expect(tree).to.have.property('count', 1)
        expect(tree).to.be.equal(counter)
      })

      it('function receives path', () => {
        expect(path).to.be.deep.equal([])
      })

      it('only notifies subscribers if state has changed', () => {
        const [ count, setCount ] = counter('count')

        let notified = false
        counter.subscribe(() => { notified = true })
        setCount(count)

        expect(notified).to.be.equal(false)
      })

      it('subscriber must be a function', () => {
        expect(() => counter.subscribe('ace'))
          .to.throw('must be a function')
      })

      describe('path argument', () => {

        let scores
        let thing1
        let thing2
        before(() => {
          scores = ScoreStateTree()
          thing1 = {
            notifies: 0,
            notifier (state) {
              this.notifies++
            }
          }

          thing2 = copy(thing1)

          scores.subscribe(::thing1.notifier, 'average')
          scores.subscribe(::thing2.notifier, 'average', 'scores')
          scores.addScore(5)
          scores.addScore(10)
          scores.addScore(15)
        })

        it('restricts state changes to ones matching path', () => {
          expect(thing1.notifies).to.be.equal(3)
          expect(scores.average).to.be.equal(10)
        })

        it('can listen to multiple paths', () => {
          expect(thing2.notifies).to.be.equal(6)
        })
      })
    })
  })

  describe('exceptions', () => {

    it('state keys may not be equal \'subscribe\' or \'unsubscribe\'', () => {
      for (const bad of [ 'subscribe', 'unsubscribe' ])
        expect(() => new StateTree({
          [bad]: 'time'
        }, {})).to.throw(`'${bad}' cannot be used as a state key`)
    })

    it('action keys not be equal \'subscribe\' or \'unsubscribe\'', () => {
      for (const bad of [ 'subscribe', 'unsubscribe' ])
        expect(() => new StateTree({}, {
          [bad] () {}
        })).to.throw(`'${bad}' cannot be used as an action key`)
    })

    it('state updates may not include keys that did not exist on initial state', () => {
      const counter = CounterStateTree()
      expect(() => counter().set({ foo: 'bar' }))
        .to.throw(`'foo' is not a valid state key.`)
    })

    it('state keys may not be the same as action names', () => {
      expect(() => new StateTree({
        foo: 0
      }, {
        foo () {}
      })).to.throw(`'foo' cannot be used as a state key.`)
    })
  })

  describe('nesting', () => {
    let app, player
    before(() => {

      const Bar = () => new StateTree({
        amount: 100,
        max: 100
      }, {
        set (amount) {
          const { max } = this
          this('amount').set(clamp(amount, 0, max))
        }
      })

      player = new StateTree({
        hp: Bar(),
        mana: Bar(),
        controller: 'ai'
      }, {
        setController (value) {
          this('controller').set(value)
        }
      })

      app = new StateTree({
        scores: [],
        player
      }, { })
    })

    it('trees can be nested as states in other trees', () => {
      expect($$state in app.player).to.be.equal(true)
      expect($$state in app.player.hp).to.be.equal(true)
    })

    it('parents are notified of changes to child state trees', () => {

      let called = false
      const func = () => { called = true }

      app.subscribe(func)
      app.player.hp.set(50)

      expect(called).to.be.equal(true)
    })

    it('subscribers are deferred to nested trees', () => {

      let called = false
      const func = () => { called = true }

      app.subscribe(func, [ 'player', 'hp', 'amount' ])
      app.player.hp.set(75)

      expect(app.player.hp.amount).to.be.equal(75)
      expect(called).to.be.equal(true)
    })

    it('on state update, tree argument comes from tree belonging to action, rather than root', () => {
      let sourceTree
      const func = tree => { sourceTree = tree }
      app.player.hp.subscribe(func)
      app.player.hp.set(50)

      expect(sourceTree).to.be.equal(app.player.hp)
    })

    describe('root property', () => {
      it('is added to child state trees', () => {
        expect(app.player.hp).to.have.property('root')
      })
      it('value is parent', () => {
        expect(app.player.hp).to.have.property('root', app)
      })
    })

    describe('parent property', () => {
      it('is added to child state trees', () => {
        expect(app.player.hp).to.have.property('parent')
      })
      it('value is parent', () => {
        expect(app.player.hp).to.have.property('parent', app.player)
      })
    })

  })
})
