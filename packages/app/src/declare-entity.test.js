import { expect } from 'chai'

import declareEntity from './declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from './util'

// import is from 'is-explicit'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('declareEntity', () => {

  it('returns an entity', () => {
    const rest = <rest />

    expect(rest)
      .to
      .have
      .property($$entity)

    expect(rest[$$entity])
      .to
      .have
      .property('type', 'rest')
  })

  it('must be a valid type', () => {
    expect(() => <invalid />).to.throw('\'invalid\' not a recognized entity.')
  })

})
