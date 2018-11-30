import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<rest/>', () => {

  it('can be created by <rest/>', () => {
    const rest = <rest />
    expect(rest[$$entity]).to.have.property('type', 'rest')
  })

  describe('entity function', () => {

    it('adds rest functionality to an app', () => {

      const app = <app />

      let feathers = app()
      expect(feathers).to.not.have.property('rest')

      const rest = <rest />
      feathers = rest(feathers)

      expect(feathers).to.have.property('rest')
    })

    it('sets props to app.settings.rest', () => {
      const app = <app>
        <rest public='./dist/public' />
      </app>

      const feathers = app()
      expect(feathers.settings.rest).to.have.property('public', './dist/public')
    })

    it('throws is provided children')
    it('throws if not invoked with app')
  })
})
