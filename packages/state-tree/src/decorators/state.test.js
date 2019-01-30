import { expect } from 'chai'
import state from './state'
import StateTree from '../state-tree'

import { $$tree, $$state } from '../util'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('@state decorator', () => {

  it('is a function', () => {
    expect(typeof state).to.be.equal('function')
  })

  it('exists in StateTree.decorators', () => {
    expect(StateTree.decorators[state.name]).to.be.equal(state)
  })

  it('may only decorate state-tree properties', () => {

    expect(() => class {
      @state
      foo = 'foo'
    }).to.throw(
      '@state decorator can only decorate properties on classes ' +
      'extended from StateTree'
    )

    expect(() => class Bar extends StateTree {
      @state
      foo = 'foo'
    }).to.not.throw(Error)

  })

  it('may only decorate methods', () => {
    expect(() => class Bar extends StateTree {
      @state
      setFoo = foo => foo
    }).to.throw('@state decorator can not decorate methods')
  })

  describe('effect on extended StateTree', () => {

    let Counter
    before(() => {
      Counter = class extends StateTree {
        @state
        count = 0
      }
    })

    it('mutates static $$tree property on extended class to define initial state', () => {
      expect(Counter[$$tree].state.initial).to.have.property('count', 0)
    })

    it('extended class $$tree mutations do not effect base class', () => {
      expect(StateTree[$$tree].state.initial).to.not.have.property('count')
    })

    it('objects placed in initial states should be immutable copies', () => {
      const VectorZero = { x: 0, y: 0 }
      const VectorOne = { x: 1, y: 1 }

      class Coords extends StateTree {
        @state
        scale = VectorOne

        @state
        position = VectorZero
      }

      expect(Coords[$$tree].state.initial).to.have.deep.property('scale', VectorOne)
      expect(Coords[$$tree].state.initial.scale).to.not.be.equal(VectorOne)
    })

    it('property name added to state.keys', () => {
      expect(Counter[$$tree].state.keys).to.be.deep.equal(['count'])
    })

  })

  describe('effect on instance of extended StateTree', () => {

    let TrafficLight
    let light
    before(() => {
      TrafficLight = class extends StateTree {
        @state
        color = 'green'
      }

      light = new TrafficLight()
    })

    it('property has initial state value', () => {
      expect(light).to.have.property('color', 'green')
    })

    it('property has been replaced with a getter to internal state', () => {
      const descriptor = Object
        .getOwnPropertyDescriptor(TrafficLight.prototype, 'color')

      expect(descriptor.get).to.be.instanceof(Function)
      expect(descriptor.enumerable).to.be.equal(true)
    })

    it('property is read only', () => {
      expect(() => (light.color = 'red')).to.throw('has only a getter')
      expect(() => (light[$$state].state.color = 'red')).to.throw('read only')
    })

  })

  describe('can\'t use names that already exist in State', () => {
    for (const invalidName of Object.getOwnPropertyNames(StateTree.prototype))
      it(`can't use: '${invalidName}'`, () => {
        expect(() => {
          class Example extends StateTree {}

          const initializer = () => 0
          state(Example.prototype, invalidName, { initializer })

        }).to.throw(`can not use '${invalidName}' as a state key`)
      })
  })
})
