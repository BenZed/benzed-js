import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('rest entity', () => {

  it('can be created by <rest/>', () => {
    const rest = <rest />
    expect(rest[$$entity]).to.have.property('type', 'rest')
  })

  describe('entity function', () => {

    it('adds rest functionality to an app', () => {

      const app = <app port='2000' />

      let feathers = app()
      expect(feathers).to.not.have.property('rest')

      const rest = <rest />
      feathers = rest(feathers)

      expect(feathers).to.have.property('rest')
    })
  })
})
