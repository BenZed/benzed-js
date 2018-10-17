import { expect } from 'chai'
import is from 'is-explicit'

import mergeResults from './merge-results'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Fake validators
/******************************************************************************/

const noZero = value => value === 0
  ? throw new Error('no zeros')
  : value

const round = value => is.number(value)
  ? Math.round(value)
  : value

const noFoo = value => value === 'foo'
  ? throw new Error('no foo')
  : value

describe('mergeResult', () => {

  it('merges simple compiler results', () => {
    expect(mergeResults(noZero, [ round ])).to.be.deep.equal([ noZero, round ])
  })

  it('merges simple results with complex', () => {

    const complex = {
      props: { round: 0.25 },
      validators: [ round ]
    }

    expect(mergeResults(noZero, complex, [ noFoo ]))
      .to.be.deep.equal({
        props: { round: 0.25 },
        validators: [ noZero, round, noFoo ]
      })

  })

  it('merges complex results with complex', () => {

    const complex1 = {
      props: { round: 0.25, cast: true },
      validators: [ round ]
    }

    const complex2 = {
      props: { round: 0.5, noFoo: 2 },
      validators: [ noZero, noFoo ]
    }

    expect(mergeResults(complex1, complex2))
      .to.be.deep.equal({
        props: { round: 0.5, noFoo: 2, cast: true },
        validators: [ round, noZero, noFoo ]
      })
  })

  it('merges plainObjects as props', () => {
    const simple1 = noZero
    const complex1 = {
      props: { round: 0.25, cast: true },
      validators: [ round ]
    }
    const props = {
      cast: false,
      cake: 'town'
    }

    expect(mergeResults(simple1, complex1, props)).to.be.deep.equal({
      props: {
        cast: false,
        cake: 'town',
        round: 0.25
      },
      validators: [ noZero, round ]
    })

  })
})
