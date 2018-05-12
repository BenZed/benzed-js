// import { expect } from 'chai'
//
// import Hook from './hook'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Hook', () => {

  it('is a class')

  describe('configuration', () => {

    describe('name string', () => {
      it('determines name of result hook function')
      it('defaults to name of exec function, if defined')
    })

    describe('priority number', () => {
      it('defaults to 0')
    })

    it('methods array')

    it('types array')

    it('exec function')

    it('setup function')

  })

  describe('returns', () => {

    describe('hook-setup if config.setup is defined', () => {
      it('hook-setup returns hook when called')
      it('the output of hook-setup is placed in hook.options')
      it('hook-setup has `setup-#{config.name}` as a name')
    })

    describe('hook if config.setup is not defined', () => {
      it('hook is named config.name')
      it('hook has PRIORITY symbol matching config.priority')
      it('hook is bound to Hook class instance and can call helper methods')
    })

  })

  describe('helper methods', () => {

    describe('checkContext', () => {
      it('calls feathers-hooks-common/check-context')
      it('returns a context info object')
    })

  })

})

describe('setPriority', () => {
  it('sets the priority of a given function')
  it('intended to be used on generic hooks')
  it('throws if not bound to hook')
  it('throws if value is not a number')
})
