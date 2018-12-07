import { assert, expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'
import { first } from '@benzed/array'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<express/>', () => {

  it('can be created by <express/>', () => {
    const express = <express />
    expect(express[$$entity]).to.have.property('type', 'express')
  })

  describe('entity function', () => {

    it('adds rest functionality to an app', () => {

      const app = <app />

      let feathers = app()
      expect(feathers).to.not.have.property('rest')

      const express = <express />
      feathers = express(feathers)

      expect(feathers).to.have.property('rest')
    })

    it('throws is provided children', () => {
      expect(() => <express>{() => {}}</express>)
        .to.throw('express.children must be empty')
    })

    it('throws if not invoked with app', () => {
      const entity = <express />

      expect(entity).to.throw('<express/> must be parented to an <app/> entity')
    })

    it('retains previous settings', () => {
      const app = (<app foo='bar'>
        <express />
      </app>)()

      expect(app.settings.foo).to.be.equal('bar')
    })

    it('retains previously registered event handlers', () => {

      const register = {
        called: 0,
        handler () {
          this.called++
        },
        event: ({ type, children }) =>
          app => {
            app.on(type, first(children))
          }
      }
      // eslint-disable-next-line

      const app = (<app>
        <register.event type='foo' >{::register.handler}</register.event>
        <register.event type='mount' >{::register.handler}</register.event>
        <express />
      </app>)()

      app.emit('foo')

      assert(register.called === 1, 'event handlers not retained')
      assert(
        app._events?.mount instanceof Array && app._events?.mount.length === 2,
        'onmount handler not merged with one added by express'
      )
    })

  })
})
