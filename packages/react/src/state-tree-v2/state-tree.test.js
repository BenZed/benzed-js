import { expect } from 'chai'
import StateTree from './state-tree'

import { push, set, get, copy } from '@benzed/immutable'
import { milliseconds } from '@benzed/async'
import { memoize, state, action } from './decorators'

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

  // @action.compound
  // fetchScores = address => [
  //
  //   state => state::set('fetching', true),
  //
  //   state => fetch(address)
  //     .then(scores => state::set('scores', scores)),
  //
  //   state => state::set('fetching', true)
  // ]

  // @memoize('scores')
  // get average () {
  //   return this
  //     .scores
  //     .reduce((sum, value) => sum + value) / this.scores.length
  // }

}

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('StateTree', () => {

  it('is a class', () => {
    expect(StateTree).to.be.instanceof(Function)
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
          notifier (tree) {
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

  describe('toJSON', () => {
    it('is a method')
  })

  describe('$$copy', () => {
    it('is a method')
  })

  describe('$$equals', () => {
    it('is a method')
  })

})
