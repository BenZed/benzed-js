import { expect } from 'chai'
import connectToDatabase from './connect-to-database'
import App from '../app'

import { ChildProcess } from 'child_process'
import { expectReject } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.skip('connectToDatabase()', () => {

  it('is a function', () => {
    expect(connectToDatabase).to.be.instanceof(Function)
  })

  it('must be bound to app', () => {
    return connectToDatabase()::expectReject('Cannot destructure property `feathers`')
  })

  it('ignored if mongodb is not configured', () => {
    const app = new App({
      port: 4000,
      socketio: true,
      logging: false
    })
    app.logging = false
    expect(app::connectToDatabase).to.not.throw(Error)
  })

  it('connects to database')

  it('disconnects from database on app close')

  it('uses auth if provided with a username and password')

  describe('creates mongodb process', () => {

    it('if a single local host was defined', async () => {

      const app = new App({
        port: 4600,
        socketio: true,
        logging: false,
        mongodb: {
          database: 'test-app',
          hosts: 'localhost:4650'
        }
      })

      app.logging = false

      await app::connectToDatabase()

      expect(app.database).to.not.equal(null)
      expect(app.database.process).to.not.equal(null)
      expect(app.database.process).to.be.instanceof(ChildProcess)

      await app.end()
    })

    it('throws if mongo process exists')

    it('throws if mongo is not installed')

    it('process is shut down on app close')

  })

})
