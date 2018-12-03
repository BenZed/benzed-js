import { expect } from 'chai'
import run from './run'
import declareEntity from './declare-entity' // eslint-disable-line no-unused-vars
import { expectReject } from '@benzed/dev'

/* @jsx declareEntity */
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('run', () => {

  let app
  before(async () => {
    app = await run(<app>
      <express/>
    </app>)
  })

  after(() => app && app.end())

  it('starts applications', () => {
    return expect(app.listener).to.not.be.undefined
  })

  it('uses given port', async () => {

    const PORT = 7171

    const app = await run(<app port={PORT}><express/></app>)
    expect(app.listener.address().port).to.be.equal(PORT)

    await app.end()
  })

  it('uses random port if port is not defined', () => {
    expect(app.listener.address().port)
      .to.be.equal(app.get('port'))
  })

  it('applications require a provider', async () => {
    await run(<app/>)::expectReject('no providers setup')
  })

})
