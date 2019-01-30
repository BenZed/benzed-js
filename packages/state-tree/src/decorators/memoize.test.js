import { expect } from 'chai'
import memoize from './memoize'
import state from './state'
import action from './action'
import StateTree from '../state-tree'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('@memoize decorator', () => {

  it('is a function', () => {
    expect(typeof memoize).to.be.equal('function')
  })

  it('exists in StateTree.decorators', () => {
    expect(StateTree.decorators[memoize.name]).to.be.equal(memoize)
  })

  it('may only decorate state-tree properties', () => {

    expect(() => class {
      @memoize
      setFoo = foo => foo
    }).to.throw(
      '@memoize decorator can only decorate getters on classes ' +
      'extended from StateTree'
    )

    expect(() => class Bar extends StateTree {

      @memoize
      get foo () {
        return this._foo
      }

    }).to.not.throw(Error)

  })

  it('may only decorate getters', () => {
    expect(() => class Bar extends StateTree {
      @memoize
      foo = 'bar'
    }).to.throw('@memoize decorator can only decorate getters')
  })

  describe('usage', () => {

    let calculations = 0
    let scores
    before(() => {

      class Scores extends StateTree {

        @state
        scores = [1, 2, 3]

        @action('scores')
        setScores = scores => scores

        @memoize('scores')
        get average () {
          calculations++
          return this
            .scores
            .reduce((total, score) => total + score) / this.scores.length
        }

      }

      scores = new Scores()

      const accesses = []
      for (let accessCount = 1; accessCount <= 10; accessCount++)
        accesses.push(scores.average)

    })

    it('caches calls made to getter until state has changed', () => {
      expect(calculations).to.be.equal(1)
    })

    it('updates if state paths change', () => {
      const prevCalculations = calculations
      scores.setScores([10, 5, 10, 20, 5])
      expect(scores.average).to.be.equal(10)
      // accessing it twice :D
      expect(scores.average).to.be.equal(10)

      expect(calculations).to.be.equal(prevCalculations + 1)
    })

    it('can listen to multiple paths', () => {

      let calculations = 0

      class Equip extends StateTree {

        @state
        leftHand = null

        @state
        rightHand = null

        @action('leftHand')
        setLeftHand = value => value

        @action('rightHand')
        setRightHand = value => value

        @action
        setDualWeild = item => ({ leftHand: item, rightHand: item })

        @memoize('leftHand', 'rightHand')
        get handsFull () {
          calculations++
          return !!(this.leftHand && this.rightHand)
        }

      }

      const equip = new Equip()
      expect(equip.handsFull).to.be.equal(false)
      expect(calculations).to.be.equal(2)

      equip.setLeftHand('flashlight')
      expect(equip.handsFull).to.be.equal(false)
      expect(calculations).to.be.equal(3)

      equip.setRightHand('sword')
      expect(equip.handsFull).to.be.equal(true)
      expect(calculations).to.be.equal(4)

      equip.setDualWeild('sword')
      expect(equip.handsFull).to.be.equal(true)
      expect(calculations).to.be.equal(5)

    })

  })

})
