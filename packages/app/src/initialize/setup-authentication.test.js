import { expect } from 'chai'
import setupProviders from './setup-providers'
import setupAuthentication from './setup-authentication'
// import setupServices from './setup-services'
// import setupMiddleware from './setup-middleware'

import { createProjectAppAndTest } from '../../test-util/test-project'

import App from 'src/app'

import { set } from '@benzed/immutable'

import path from 'path'
import fs from 'fs-extra'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// DATA
/******************************************************************************/

const DB_DIR = path.resolve(__dirname, '../../temp/test-setup-authentication-dbpath')

fs.ensureDirSync(DB_DIR)
fs.removeSync(DB_DIR)
fs.ensureDirSync(DB_DIR)

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const EMAIL = 'test-user@email.com'

const PASS = 'password'

/******************************************************************************/
// Test
/******************************************************************************/

const AUTH = {
  port: 4450,
  auth: true,
  rest: true,
  mongodb: {
    database: 'test',
    dbpath: DB_DIR,
    hosts: 'localhost:3200'
  },
  services: {
    users: true
  }
}

describe.only('setupAuthentication()', () => {

  it('must be bound to app', () => {
    expect(setupAuthentication).to.throw('Cannot destructure property `feathers` of \'undefined\'')
  })

  let app, authService

  before(() => {
    try {
      app = new App(AUTH)
      app::setupProviders()
      app::setupAuthentication()
      authService = app.feathers.service('authentication')
    } catch (err) {
      console.error(err)
    }
  })

  after(() =>
    app.end()
  )

  describe('if auth is defined', () => {
    it('adds authentication service', () =>
      expect(typeof authService).to.be.equal('object')
    )

    it('adds authentication hooks', () => {
      const beforeHooks = authService.__hooks.before
      expect(beforeHooks.create).to.have.length(1)
      expect(beforeHooks.remove).to.have.length(1)
    })

    it('throws if rest is not enabled', () => {
      const config = AUTH
        ::set('rest', false)
        ::set('socketio', true)

      const app = new App(config)
      app::setupProviders()
      expect(() => app::setupAuthentication()).to.throw('cannot be setup on this app. Rest provider is not enabled')
    })

    it('requires that config.services.users be enabled', () => {
      const app = new App(AUTH::set('services', null))

      expect(app::setupAuthentication).to.throw('"users" service is not enabled.')
    })

  })

  describe('if auth is not defined', () => {
    it('does nothing', () => {
      const app = new App({ ...AUTH, auth: null })
      expect(app.feathers.service('authentication')).to.equal(undefined)
    })
  })

  describe('once setup in a running socketio app', () => {

    const socketIOAuth = AUTH
      ::set('socketio', true)
      ::set('auth', { secret: 'deterministic' })

    createProjectAppAndTest(socketIOAuth, state => {

      beforeEach(async () => {
        if (state.client.io.connected)
          await new Promise(resolve => {
            state.client.io.once('disconnect', resolve)
            state.client.io.disconnect()
          })

        const users = await state.app.users.find({})
        if (!users.some(u => u.email === EMAIL))
          await state.app.users.create({
            email: EMAIL,
            password: PASS,
            passwordConfirm: PASS
          })
      })

      it('allows users to authenticate', async () => {
        await state.client.connect()
        const res = await state.client.authenticate({
          strategy: 'local',
          email: EMAIL,
          password: PASS
        }).catch(err => err)

        expect(res).to.have.property('accessToken')
        expect(res).to.not.have.property('code')
        expect(res).to.not.have.property('message', 'Invalid login')
      })

      it('fails if invalid credentials', async () => {
        await state.client.connect()
        const res = await state.client.authenticate({
          strategy: 'local',
          email: 'not-a-real-email@email.com',
          password: 'whatever'
        }).catch(err => err)

        expect(res).to.not.have.property('accessToken')
        expect(res).to.have.property('code')
        expect(res).to.have.property('message', 'Invalid login')
      })
    })
  })

  after(() => app && app.listener && app.end())

})
