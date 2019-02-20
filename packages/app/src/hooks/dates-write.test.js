import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'

// @jsx declareEntity

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('write-date-fields hook', () => {

  it('can be declared with jsx', () => {
    const hook = <write-date-fields />

    expect(hook.name).to.be.equal('write-date-fields')
  })

  it('is a before patch/create/update hook', () => {
    const hook = <write-date-fields />

    const data = {}

    const ctx = {
      method: 'create',
      type: 'before',
      data
    }

    hook(ctx)

    console.log(ctx)

  })

})
