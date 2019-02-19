import { expect } from 'chai'
import declareEntity from '../../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../../util'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('<authenticate/>', () => {

  it('can be created by <authenticate/>', () => {
    const authHook = <authenticate strategy='jwt' />
    expect(authHook[$$entity]).to.have.property('type', 'authenticate')
  })

  it('returns an auth hook', () => {
    const authHook = <authenticate>jwt</authenticate>
    expect(authHook.toString()).to.include('const app = hook.app')
  })

  it('takes a strategy prop or string children')

  it('throws if given any arguments', () => {

    expect(<service name='users'>
      <authenticate strategy='local' />
    </service>)
      .to.throw('invalid placement, ensure that <hook/> is placed within a <hooks/> entity.')

  })

  it('throws if given non string children')

})
