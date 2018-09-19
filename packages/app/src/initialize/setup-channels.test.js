import App from '../app'

import path from 'path'
import fs from 'fs-extra'

import { expect } from 'chai'

import setupChannels from './setup-channels'
import { set } from '@benzed/immutable'

import TestApp from '../../test-util/test-project/test-app'
import { createProjectAppAndTest } from '../../test-util/test-project'
import { milliseconds } from '@benzed/async'

/******************************************************************************/
// Types
/******************************************************************************/

class CustomChannelApp extends TestApp {

  stats = {
    setupChannelRan: 0,
    publishChannelRan: 0
  }

  setupChannels () {
    this.stats.setupChannelRan++
  }

  publishChannels () {
    this.stats.publishChannelRan++
    return this.feathers.channel(['anonymous'])
  }

}

/******************************************************************************/
// Data
/******************************************************************************/

const BASIC = {
  port: 7182,
  socketio: true,
  services: {
    apples: true,
    oranges: true
  }
}

const dbpath = path.resolve(__dirname, '../../temp/test-setup-channels-dbpath')
fs.ensureDirSync(dbpath)

const AUTH = BASIC
  ::set(['services', 'users'], true)
  ::set(['services', 'oranges'], { auth: false })
  ::set('auth', true)
  ::set('rest', true)
  ::set('port', BASIC.port + 100)
  ::set('mongodb', {
    hosts: `localhost:${BASIC.port + 200}`,
    database: 'setup-channels-test-db',
    dbpath
  })

const REST = BASIC
  ::set('socketio', false)
  ::set('rest', true)

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('setupChannels', () => {

  it('is a Function', () => {
    expect(setupChannels).to.be.instanceof(Function)
  })

  it('must be bound to app', () => {
    expect(setupChannels)
      .to
      .throw('Cannot destructure property `feathers` of \'undefined\'')
  })

  it('does nothing if socketio is not enabled', () => {
    const app = new App(REST)
    expect(app::setupChannels).to.not.throw(Error)
  })

  createProjectAppAndTest(BASIC, state => {

    describe('in a non-auth app', () => {

      const counter = {
        created: 0,
        patched: 0,
        updated: 0,
        removed: 0
      }

      before(async () => {

        const { client, app } = state

        await client.connect()
        for (const key in counter)
          client
            .service('apples')
            .on(key, () => {
              counter[key]++
            })

        // eslint-disable-next-line
        let [ a1, a2 ] = await app.apples.create([
          { type: 'granny-smith', size: 'medium' },
          { type: 'red-delicious', size: 'large' }
        ])

        a1 = await app.apples.patch(a1._id, { status: 'sliced' })
        a2 = await app.apples.update(a2._id, { ...a2, status: 'eaten' })
        await app.apples.remove(a2._id)

        await milliseconds(10)
      })

      it('sends create events', () => {
        expect(counter.created).to.be.equal(2)
      })

      it('sends patch events', () => {
        expect(counter.patched).to.be.equal(1)
      })

      it('sends update events', () => {
        expect(counter.updated).to.be.equal(1)
      })

      it('sends remove events', () => {
        expect(counter.removed).to.be.equal(1)
      })

    })
  })

  // You're creating tests for custom setupChannel and publishChannel functionality
  createProjectAppAndTest(BASIC::set('App', () => CustomChannelApp)::set('port', 6192), state => {
    describe('in an app with services with custom publish functionality', () => {
      before(async () => {
        await state.client.connect()
        await state.app.apples.create({})
      })
      it('uses custom setupChannels function on app', () => {
        expect(state.app.stats.setupChannelRan).to.be.equal(1)
      })
      it('uses custom publishChannels function on app', () => {
        expect(state.app.stats.publishChannelRan).to.be.equal(1)
      })

    })
  })

  createProjectAppAndTest(AUTH, state => {

    describe('in a auth app', () => {

      const counter = {
        apples: {
          created: 0,
          patched: 0,
          updated: 0,
          removed: 0
        },
        oranges: {
          created: 0,
          patched: 0,
          updated: 0,
          removed: 0
        }
      }

      before(async () => {

        const { client, app } = state

        await client.connect()
        for (const key in counter.apples) {
          client.service('apples').on(key, () => {
            counter.apples[key]++
          })
          client.service('oranges').on(key, () => {
            counter.oranges[key]++
          })
        }

        const EMAIL = 'user@fruit.com'
        const PASSWORD = 'buck-cherry'

        await app.users.create({
          email: EMAIL,
          password: PASSWORD,
          passwordConfirm: PASSWORD
        })

        // eslint-disable-next-line
        const doApple = async () => {
          let a = await app.apples.create({ type: 'macintosh', size: 'small' })
          a = await app.apples.patch(a._id, { eaten: 0.4 })
          a = await app.apples.update(a._id, { ...a, eaten: 0.8 })
          await app.apples.remove(a._id)
        }

        await doApple()
        await client.authenticate({ strategy: 'local', email: EMAIL, password: PASSWORD })
        await doApple()

        let o1 = await app.oranges.create({ type: 'mandarin', size: 'small' })
        o1 = await app.oranges.patch(o1._id, { slices: 4 })
        o1 = await app.oranges.update(o1._id, { ...o1, slices: 0 })
        await app.oranges.remove(o1._id)

        await milliseconds(10)
      })

      describe('auth services only send events to logged in users', () => {
        it('create events', () => {
          expect(counter.apples.created).to.be.equal(1)
        })
        it('patch events', () => {
          expect(counter.apples.patched).to.be.equal(1)
        })
        it('update events', () => {
          expect(counter.apples.updated).to.be.equal(1)
        })
        it('remove events', () => {
          expect(counter.apples.removed).to.be.equal(1)
        })
      })

      describe('non-auth services send events to everyone', () => {
        it('create events', () => {
          expect(counter.oranges.created).to.be.equal(1)
        })
        it('patch events', () => {
          expect(counter.oranges.patched).to.be.equal(1)
        })
        it('update events', () => {
          expect(counter.oranges.updated).to.be.equal(1)
        })
        it('remove events', () => {
          expect(counter.oranges.removed).to.be.equal(1)
        })
      })
    })
  })
})
