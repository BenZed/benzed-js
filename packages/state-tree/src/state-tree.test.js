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

      it('can listen to multiple paths', () => {
        expect(thing2.notifies).to.be.equal(5)
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

})
