import { expect } from 'chai'

import writeTemplates from './write-templates'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('writeTemplates', () => {

  it('needs to be bound to a context', () => {
    expect(() => writeTemplates())
      .to
      .throw('be bound to a context')
  })

})
