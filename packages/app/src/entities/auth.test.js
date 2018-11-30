import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<auth/>', () => {

  it('can be created by <auth/>', () => {
    const auth = <auth />
    expect(auth[$$entity]).to.have.property('type', 'auth')
  })

  describe('entity function', () => {

    it('throws if rest is not configured', () => {
      expect(<app><auth/></app>)
        .to.throw('authentication cannot be configured without rest')
    })

    it('adds auth functionality to an app', () => {

      const app = <app><rest/></app>

      const feathers = app()

      expect(feathers).to.not.have.property('authenticate')

      const auth = <auth />
      auth(feathers)

      expect(feathers).to.have.property('authenticate')
    })

    it('sets props to app.settings.auth', () => {
      const app = <app>
        <rest/>
        <auth entity='people' />
      </app>

      const feathers = app()
      expect(feathers.settings.auth)
        .to.have.property('entity', 'people')
    })

    it('throws if provided children')
    it('throws if not invoked with app')
  })
})
