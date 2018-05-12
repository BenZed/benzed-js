import { expect } from 'chai'
import registerToFeathers from './register-to-feathers'
import App from 'src/app'

import { Service as MemoryService } from 'feathers-memory'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Helper
/******************************************************************************/

const serviceDummy = {
  preRegisterWare: () => [],
  postRegisterWare: () => []
}

/******************************************************************************/
// Tests
/******************************************************************************/

describe('registerToFeathers', () => {

  it('is a function', () => {
    expect(registerToFeathers).to.be.instanceof(Function)
  })

  it('is named registerToFeathers', () => {
    expect(registerToFeathers).to.have.property('name', 'registerToFeathers')
  })

  it('is bound to Service instance', () => {
    expect(() => registerToFeathers({})).to.throw('Cannot read property \'preRegisterWare\' of undefined')
  })

  // TODO figure out if pre and post ware matter if rest is enabled
  describe('registers preWare', () => {
    it('receives config and app as arguments')
    it('only if app has rest enabled??')
    it('registers output from preRegisterWare')
    it('throws if preRegisterWare doesnt return an empty array or an array of functions')
  })

  describe('postWare', () => {
    it('receives config and app as arguments')

    it('only if app has rest enabled??')
    it('registers output from postRegisterWare')
    it('throws if postRegisterWare doesnt return an empty array or an array of functions')
  })

  it('adds service to app.feathers', () => {
    const app = new App({
      port: 1800,
      socketio: true
    })

    const adapter = new MemoryService()
    const service = serviceDummy
      ::registerToFeathers(app, 'articles', adapter, {})

    expect(app.feathers.service('articles')).to.equal(service)
  })

})
