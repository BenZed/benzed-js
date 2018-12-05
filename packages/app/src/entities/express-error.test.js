import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<express-error/>', () => {

  it('can be created by <express-error/>', () => {
    const error = <express-error />
    expect(error[$$entity]).to.have.property('type', 'express-error')
  })

  describe('entity function', () => {

    it('adds rest error handling to an app')

    it('throws is provided children')
    it('throws if not invoked with app')

    it('logger option')

    it('html option')

  })
})
