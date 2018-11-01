import { expect } from 'chai'

import declareEntity from './declare-entity' // eslint-disable-line no-unused-vars
import { ENTITY } from './util'

import is from 'is-explicit'

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
      .property(ENTITY)

    expect(rest[ENTITY])
      .to
      .have
      .property('type', 'rest')
  })

})
