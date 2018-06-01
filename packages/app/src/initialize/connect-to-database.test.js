import { expect } from 'chai'
import connectToDatabase from './connect-to-database'
import App from '../app'

import { ChildProcess } from 'child_process'
import { expectReject } from '@benzed/dev'

import path from 'path'
import fs from 'fs-extra'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// DATA
/******************************************************************************/

const DB_DIR = path.resolve(__dirname, '../../temp/test-connect-to-database-dbpath')

fs.ensureDirSync(DB_DIR)

/******************************************************************************/
// TESTS
/******************************************************************************/

describe('connectToDatabase()', () => {

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
    expect(app::connectToDatabase).to.not.throw(Error)
  })

  it('connects to database')

  it('disconnects from database on app close')

  it('uses auth if provided with a username and password')

  describe('creates mongodb process', () => {

    let app
    before(async () => {

      fs.removeSync(DB_DIR)
      fs.ensureDirSync(DB_DIR)

      app = new App({
        port: 4600,
        socketio: true,
        logging: false,
        mongodb: {
          dbpath: DB_DIR,
          database: 'test-app',
          hosts: 'localhost:4650'
        }
      })

      await app::connectToDatabase()
    })

    it('if a single local host was defined', () => {
      expect(app.database).to.not.equal(null)
      expect(app.database.process).to.not.equal(null)
      expect(app.database.process).to.be.instanceof(ChildProcess)
    })

    it('uses dbpath if provided', () => {
      const names = fs.readdirSync(DB_DIR)
      expect(names.length > 0).to.be.equal(true)
    })

    it('throws if mongo process exists')
    it('throws if mongo is not installed')
    it('process is shut down on app close')

    after(async () => {
      await app.end()
    })
  })
})
