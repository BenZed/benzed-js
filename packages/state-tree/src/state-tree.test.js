import { expect } from 'chai'
import StateTree from './state-tree'

import { push, set, get, copy } from '@benzed/immutable'
import { first } from '@benzed/array'
import { clamp } from '@benzed/math'

import { memoize, state, action } from './decorators'

import is from 'is-explicit'

/******************************************************************************/
// Data
/******************************************************************************/

class ScoreCard extends StateTree {

  @state
  scores = []

  @state
  raised = false

  @action('scores')
  addScore = score => this.scores::push(score)

  @action('scores')
  setScores = scores => scores

  @action('scores')
  clearScores = () => []

  @action('raised')
  toggleRaised = () => !this.raised

  @memoize('scores')
  get average () {

    const scores = [ ...this.scores ]

    while (scores.length < 2)
      scores.push(first(scores) || 0)

    return scores
      .reduce((sum, value) => sum + value) / scores.length
  }
}

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('StateTree', () => {

  it('is a class', () => {
    expect(StateTree).to.be.instanceof(Function)
    expect(StateTree).to.throw('invoked without \'new\'')
  })

  describe('construct', () => {

    class Flag extends StateTree {

      @state colors = [ 'red', 'white', 'blue' ]

      @state country = 'murica'

      @state waving = false

      @memoize('waving')
      get isTraitor () {
        return !this.waving
      }

    }

    it('initializes tree with static initial state', () => {
      const flag = new Flag()

      expect(flag.waving).to.be.equal(false)
      expect(flag.colors).to.be.deep.equal(['red', 'white', 'blue'])
      expect(flag.country).to.be.equal('murica')
      expect(flag.isTraitor).to.be.equal(true, 'wave that flag soldier')
    })

    it('state can be provided to constructor to override static', () => {
      const flag = new Flag({
        colors: [ 'red', 'white' ],
        country: 'canada',
        waving: true
      })

      expect(flag.waving).to.be.equal(true, 'why aintcha wavin that flag bud')
      expect(flag.colors).to.be.deep.equal([ 'red', 'white' ], 'no maple leaf buds')
      expect(flag.country).to.be.equal('canada')
      expect(flag.isTraitor).to.be.equal(!flag.waving, 'yer a fuckin traitor bud')
    })

    it('throws if provided initial state is not a plain object', () => {
      expect(() => new Flag('franceh doesn\'t know to construct objects'))
        .to.throw('initial state must be a plain object')
    })

  })

  describe('subscribe()', () => {

    let card
    let tree
    let path
    before(() => {
      card = new ScoreCard()
      card.subscribe((...args) => { [ tree, path ] = args })
      card.addScore(10)
    })

    it('allows a function to be called when state changes', () => {
      expect(tree).to.not.be.equal(undefined)
    })

    it('function receives tree as first argument', () => {
      expect(tree).to.have.deep.property('scores', [10])
      expect(tree).to.be.equal(card)
    })

    it('function receives path', () => {
      expect(path).to.be.deep.equal([])
    })

    it('only notifies subscribers if state has changed', () => {

      let notified = false

      card.subscribe(() => { notified = true })
      card.setScores([10])

      expect(notified).to.be.equal(false)
    })

    it('subscriber must be a function', () => {
      expect(() => card.subscribe('ace'))
        .to.throw('must be a function')
    })

    describe('path argument', () => {

      let scores
      let thing1
      let thing2
      before(() => {
        scores = new ScoreCard()
        thing1 = {
          notifies: 0,
          notifier (tree, subPath, updatePath) {
            this.notifies++
          }
        }

        thing2 = copy(thing1)

        scores.subscribe(::thing1.notifier, 'scores')
        scores.subscribe(::thing2.notifier, 'scores', 'raised')

        scores.toggleRaised()
        scores.addScore(5)
        scores.addScore(10)
        scores.addScore(15)
        scores.toggleRaised()

        expect(scores.average).to.be.equal(10)

      })

      it('restricts state changes to ones matching path', () => {
        expect(thing1.notifies).to.be.equal(3)
      })

      it('can listen to blank paths', () => {
        expect(() => scores.subscribe(() => {}, [])).to.not.throw(Error)
      })

      it('can listen to multiple paths', () => {
        expect(thing2.notifies).to.be.equal(5)
      })

      it('multiple invocations of the same path don\'t result in multiple listeners', () => {
        class Foo extends StateTree {
          @state
          data = {
            switch: 'off'
          }

          @action(['data', 'switch'])
          setDataSwitch = value => value ? 'on' : 'off'
        }

        let calls = 0

        const foo = new Foo()
        foo.subscribe(() => { calls++ }, [ 'data', 'switch' ], [ 'data', 'switch' ])
        foo.setDataSwitch(true)

        expect(foo.data.switch).to.be.equal('on')
        expect(calls).to.be.equal(1)

      })

      it('subscribing to memoize keys results in conversion to memoize paths', () => {

        class Foo extends StateTree {

          @state
          _hiddenHash = {}

          @memoize('_hiddenHash')
          get shownArray () {
            return Object.values(this._hiddenHash)
          }

          @memoize(['_hiddenHash', 'main'])
          get mainItem () {
            return this._hiddenHash.main
          }

          @action('_hiddenHash')
          setHiddenHash = hash => hash

        }

        const foo = new Foo()

        let mainItemCalls = 0
        let shownArrayCalls = 0
        foo.subscribe(() => {
          mainItemCalls++
        }, 'mainItem')

        foo.subscribe(() => {
          shownArrayCalls++
        }, 'shownArray')

        foo.setHiddenHash({ main: 'main' })
        foo.setHiddenHash({ ...foo._hiddenHash, aux: 'aux' })

        expect(mainItemCalls).to.be.equal(1)
        expect(shownArrayCalls).to.be.equal(2)

      })

      it('deep path equality check', () => {

        class Coord extends StateTree {
          @state
          position = { x: 0, y: 0 }

          @state
          scale = { x: 1, y: 1 }

          @action('scale')
          setScale = (x, y) => ({ x, y })
        }

        const coords = new Coord()

        const notifications = { scale: { x: 0, y: 0, either: 0 } }

        coords.subscribe(() => notifications.scale.either++)
        coords.subscribe((tree, path) => {
          notifications::set.mut(path, notifications::get.mut(path) + 1)
        }, [ 'scale', 'y' ], [ 'scale', 'x' ])

        coords.setScale(1, 2)
        coords.setScale(2, 2)
        expect(notifications.scale.either).to.be.equal(2)

        // WTF is going on here
        // state was updated with a truncated path: 'scale'
        // we have listeners at 'scale', 'x' and 'scale', 'y'
        // each one should only be called if their substate has changed.

        expect(notifications.scale.x).to.be.equal(1)
        expect(notifications.scale.y).to.be.equal(1)

      })
    })
  })

  describe('unsubscribe', () => {

    let Coin
    let face1
    let face2

    before(() => {
      Coin = class Coin extends StateTree {
        @state
        showing = 'unflipped'

        @action('showing')
        flip = () => Math.random() > 0.5 ? 'heads' : 'tails'
      }

      const coin = new Coin()

      const getFace1 = coin => { face1 = coin.showing }
      const getFace2 = coin => { face2 = coin.showing }

      coin.subscribe(getFace1, 'showing')
      coin.subscribe(getFace2, 'showing')
      coin.unsubscribe(getFace1)

      coin.flip()
    })

    it('removes subscribers from state tree', () => {
      expect(face1).to.be.equal(undefined)
      // proves that all callbacks registered to path 'showing' were not removed
      expect(face2).to.not.be.equal(undefined)
    })

  })

  describe('nesting', () => {

    let Game
    before(() => {

      class Bar extends StateTree {

        @state
        amount = 100

        @state
        max = 100

        @action('amount')
        setAmount = value => clamp(value, 0, this.max)

        @action('max')
        setMax = value => value

        @action
        set = (amount, max) => ({ amount, max })

        changeAmount = delta => this.setAmount(this.amount + delta)

        constructor (starting) {
          super()
          if (is.defined(starting))
            this.setAmount(starting)
        }

      }

      class Unit extends StateTree {

        @state
        health = new Bar()

        @state
        mana = new Bar()

        @state
        controller = 'ai'

        @action('controller')
        setController = value => value

        constructor (controller) {
          super()
          if (controller)
            this.setController(controller)
        }

      }

      Game = class Game extends StateTree {

        @state
        scores = []

        @state
        units = []

        @action('units')
        addUnit = controller =>
          this.units::push(new Unit(controller))

        @memoize('units')
        get player () {
          return this
            .units
            .filter(unit => unit.controller === 'player')
            ::first() || null
        }
      }
    })

    it('trees can be nested as states in other trees', () => {
      const game = new Game()

      game.addUnit('ai')
      game.addUnit('player')

      expect(
        game.units.every(unit => game.children.includes(unit))
      ).to.be.equal(true, 'StateTrees placed in state do not exist in rootState.children')
    })

    it('parents are notified of changes to child state trees', () => {
      const game = new Game()

      let called = false
      const func = (...args) => { called = true }

      game.addUnit('player')

      game.subscribe(func)
      game.player.health.setAmount(50)

      expect(called).to.be.equal(true)
    })

    it('subscriber gets correct base tree, subscription path and change path', () => {
      const game = new Game()

      const args = {
        game: [],
        player: []
      }

      game.addUnit('player')
      game.subscribe((..._args) => { args.game = _args }, [ 'units', 0, 'health' ])
      game.player.subscribe((..._args) => { args.player = _args }, [ 'health' ])

      game.player.health.setAmount(50)

      // Game Subscriber
      expect(args.game.length).to.be.above(0, 'Game subscriber callback was missed')

      let [ baseTree, subscriptionPath ] = args.game
      expect(baseTree).to.be.equal(game)
      expect(subscriptionPath).to.be.deep.equal([ 'units', 0, 'health' ])

      // Player Subscriber
      expect(args.player.length).to.be.above(0, 'Player subscriber callback was missed');

      ([ baseTree, subscriptionPath ] = args.player)
      expect(baseTree).to.be.equal(game.player)
      expect(subscriptionPath).to.be.deep.equal([ 'health' ])

    })

    it('nested trees get proper deep path equality check', () => {

      const game = new Game()
      game.addUnit('player')

      const notifications = { amount: 0, max: 0, either: 0 }

      game.player.subscribe(function either () { notifications.either++ })
      game.player.subscribe(function health () {
        notifications.amount++
      }, [ 'health', 'amount' ])
      game.player.subscribe(function mana () {
        notifications.max++
      }, [ 'health', 'max' ])

      game.player.health.set(75, 100)
      game.player.health.set(75, 75)

      expect(notifications.either).to.be.equal(2)
      expect(notifications.amount).to.be.equal(1)
      expect(notifications.max).to.be.equal(1)

    })

  })

  describe('setState', () => {

    it('can be used as an escape hatch for anonymous actions', () => {

      class Foo extends StateTree {
        @state
        bar = true
      }

      const foo = new Foo()

      foo.setState(false, ['bar'], 'setBar')

      expect(foo.bar).to.be.equal(false)

    })

    it('can set state at any path if no state keys are defined', () => {

      const tree = new StateTree()

      tree.setState({
        cake: 'town',
        foo: 'bar'
      }, ['nested', 0], 'setArbitraryState')

      expect(tree.state.nested[0]).to.be.deep.equal({
        foo: 'bar',
        cake: 'town'
      })
    })

    it('can set state at any path beyond first key', () => {

      class Foo extends StateTree {
        @state
        data = {}
      }

      const foo = new Foo()

      foo.setState({ what: 'is-up' }, [ 'data', 'key', 'value' ])

      expect(foo.state).to.be.deep.equal({
        data: { key: { value: { what: 'is-up' } } }
      })

    })

    it('non indexable state-keys are overwritten', () => {
      const tree = new StateTree({
        percent: { is: 'not-sure' }
      })

      tree.setState(100, ['percent', 'is', 'number', 0])
      expect(tree.state).to.be.deep.equal({
        percent: {
          is: { number: [ 100 ] }
        }
      })
    })

    it('throws if trying to set state beyond a nested state tree', () => {
      const tree = new StateTree({
        nested: [ new StateTree() ]
      })

      expect(() => tree.setState('haHA', [ 'nested', 0, 'laughSoundsLike' ]))
        .to.throw('Cannot set state inside nested State Trees')
    })

  })

  describe('toJSON', () => {

    let counter
    let state
    before(() => {
      counter = new ScoreCard()
      state = counter.toJSON()
    })

    it('returns an object that mixes state and cached memoization', () => {
      expect(state).to.be.deep.equal({ scores: [], raised: false, average: 0 })
    })

  })

  describe('get state()', () => {

    let card
    before(() => {
      card = new ScoreCard()
    })

    it('returns the tree\'s state as an object', () => {
      const card = new ScoreCard()
      expect(card.state).to.be.deep.equal({ raised: false, scores: [ ] })
    })

    it('subsequent state updates result in immutable copies', () => {
      const state = card.state
      card.addScore(10)
      card.addScore(15)
      expect(state).to.not.be.equal(card.state)
    })

    it('state is frozen', () => {
      expect(() => { card.state.raised = false }).to.throw('read only')
    })
  })

  describe('$$copy', () => {
    it('is a method')
  })

  describe('$$equals', () => {
    it('is a method')
  })

  describe('bug fixes', () => {
    it('state trees should work with dates in state', () => {

      class Clock extends StateTree {

        @state
        time = new Date()

        @action('time')
        setTime = input => (is.date(input)
          ? input
          : new Date(input))

      }

      const clock = new Clock()

      expect(clock.time).to.be.instanceof(Date, 'clock.time is not a Date')

    })
  })

  describe('large state trees update quickly', () => {

    class Body extends StateTree {
      @state
      id = null

      @state
      mass = 0

      @state
      position = { x: 0, y: 0 }

      @state
      rotation = 0

      @state
      tag = ''
    }

    class System extends StateTree {
      @state bodies = {}

      tagBody = (id, tag) => {

        const body = this.bodies[id]
        body.setState(tag, 'tag')
      }

      @action('bodies')
      removeBody = id => {

        const bodies = { ...this.bodies }
        delete bodies[id]

        return bodies
      }
    }

    const bodies = {}
    for (let i = 0; i < 10000; i++)
      bodies[i] = new Body(
        {
          id: i,
          mass: Math.random() * 1000,
          position: { x: Math.random() * 10000, y: Math.random() * 10000 },
          rotation: Math.random() * 360
        }
      )

    const system = new System({ bodies })

    it('large single tree updates in less than 50ms', function () {
      this.timeout(50)
      system.removeBody(500)
    })
  })
})
