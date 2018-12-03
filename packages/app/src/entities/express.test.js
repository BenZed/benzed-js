import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'

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

    it('sets props to app.settings.rest', () => {
      const app = <app>
        <express public='./dist/public' />
      </app>

      const feathers = app()
      expect(feathers.settings.express).to.have.property('public', './dist/public')
    })

    it('throws is provided children')
    it('throws if not invoked with app')

    it('adds error handling')
  })
})
