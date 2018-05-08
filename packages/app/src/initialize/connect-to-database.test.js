import { expect } from 'chai'
import connectToDatabase from './connect-to-database'
import App from '../app'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('connectToDatabase', () => {

  it('is a function', () => {
    expect(connectToDatabase).to.be.instanceof(Function)
  })

  it('must be bound to app', () => {
    expect(connectToDatabase).to.throw('Cannot destructure property `feathers`')
  })

  it('ignored if mongodb is not configured', () => {
    const app = new App({
      port: 4000,
      socketio: true
    })
    expect(app::connectToDatabase).to.not.throw(Error)
  })

  it('connects to database')

  describe.only('creates mongodb process', () => {

    it('if a single local host was defined', () => {

      const app = new App({
        port: 4600,
        socketio: true,
        mongodb: {
          database: 'test-app',
          hosts: 'localhost:4650'
        }
      })

      return app::connectToDatabase()

    })

    it('and mongo process does not exist')

  })

})
