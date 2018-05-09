import { expect } from 'chai'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('Service', () => {

  it('is a function')
  it('returns a function')
  it('adds a service shortcut to app')
  it('sets up a MongoService if mongodb is configured')
  it('sets up a MemoryService if mongodb is disabled')

  describe('functionality object', () => {

    it('f.hooks')
    it('f.permissions')
    it('f.schema')
    it('f.middleware')

  })

  describe('config object', () => {

    it('config.path')
    it('config.softDelete')
    it('config.versions')
    it('config.paginate')
    it('config.auth')

  })

  describe('versions', () => {
    it('sets up versions if configured')
    it('adds [name]/versions service')
  })

  describe('liveEdit', () => {
    it('sets up liveEdit if configured')
    it('adds [name]/live-edit service')
  })

})
