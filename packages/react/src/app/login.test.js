import { expect } from 'chai'
import { LoginLogic } from './login'
import { Test } from '@benzed/dev'
import { milliseconds } from '@benzed/async'

import React from 'react'
import renderer from 'react-test-renderer'
import ClientStore from './store/client-store'

import path from 'path'
import fs from 'fs-extra'

import { createProjectAppAndTest } from '@benzed/app/test-util/test-project'

/******************************************************************************/
// Helper
/******************************************************************************/

const DB_PATH = path.resolve(__dirname, '../../temp/login-component-test-db')

const PORT = 5890

const APP = {
  auth: {
    secret: 'deterministic'
  },
  rest: true,
  port: PORT,
  services: {
    users: true
  },
  mongodb: {
    dbpath: DB_PATH,
    database: 'login-component-test',
    hosts: 'localhost:' + (PORT + 100)
  }
}

const createClientStore = (override = {}) => new ClientStore({
  hosts: 'http://localhost:' + PORT,
  provider: 'rest',
  auth: true,
  ...override
})

fs.ensureDirSync(DB_PATH)
fs.removeSync(DB_PATH)
fs.ensureDirSync(DB_PATH)

/******************************************************************************/
// Tests
/******************************************************************************/

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Login component', () => {

  Test.propTypes(LoginLogic, expectError => {
    describe('props.client', () => {
      it('is required', () => {
        expectError({}).to.include('client is Required')
        expectError({
          client: createClientStore({ auth: false })
        }).to.not.include('client is Required')
      })
      it('must be client store', () => {
        expectError({
          client: {}
        }).to.include('client Must be of type: ClientStore')
      })
      it('must have authentication enabled', () => {
        expectError({
          client: createClientStore({ auth: false })
        }).to.include('must have authentication enabled')
        expectError({
          client: createClientStore()
        }).to.equal(null)
      })
    })
  })

  describe('usage', () => {

    let client, test, SUBSCRIBERS
    before(() => {
      client = createClientStore()
      SUBSCRIBERS = Object
        .getOwnPropertySymbols(client)
        .filter(sym => String(sym).includes('subscribers'))[0]

      test = renderer.create(
        <LoginLogic client={client}/>
      )
    })

    after(() => {
      test.unmount()
    })

    describe('componentDidMount()', () => {
      it('subscribes to client store', () => {

        const { onClientStoreUpdate } = test.root.instance
        const subFuncs = client[SUBSCRIBERS].map(sub => sub.callback)
        expect(subFuncs).to.include(onClientStoreUpdate)
      })
      it('sets user email from local storage')

    })

    describe('componentWillUnmount()', () => {
      it('unsubscribes from store on dismount', () => {
        const test2 = renderer.create(
          <LoginLogic client={client}/>
        )

        const { onClientStoreUpdate } = test2.root.instance

        test2.unmount()

        const subFuncs = client[SUBSCRIBERS].map(sub => sub.callback)
        expect(subFuncs).to.not.include(onClientStoreUpdate)
      })
    })

    describe('onClientStoreUpdate()', () => {
      it('sets state.visible from clientstore actions', async () => {
        client.set('host', false)
        client.set('userId', null)

        await milliseconds(5)
        expect(test.root.instance.state.visible).to.be.equal(false)

        client.set('host', true)
        client.set('userId', 'some-id')

        await milliseconds(5)
        expect(test.root.instance.state.visible).to.be.equal(false)

        client.set('host', true)
        client.set('userId', null)
        await milliseconds(5)
        expect(test.root.instance.state.visible).to.be.equal(true)
      })

      it('sets state.status from clientstore actions', async () => {
        const error = { message: 'Authentication did not happen.' }

        client.set(['login', 'status'], error)
        await milliseconds(5)

        expect(test.root.instance.state.status).to.be.equal(error)
      })
    })

    describe('setEmail()', () => {

      it('sets state.email', () => {
        const email = 'test@gmail.com'
        test.root.instance.setEmail(email)
        expect(test.root.instance.state.email).to.be.equal(email)
      })

      it('sets email in local storage')

      it('takes event.target.value if sent an event', () => {
        const event = { target: { value: 'typed@email.com' } }
        test.root.instance.setEmail(event)

        expect(test.root.instance.state.email).to.be.equal(event.target.value)
      })

    })

    describe('setPassword()', () => {

      it('sets state.password', () => {
        const password = 'password'
        test.root.instance.setPassword(password)
        expect(test.root.instance.state.password).to.be.equal(password)
      })

      it('takes event.target.value if sent an event', () => {
        const event = { target: { value: 'password' } }
        test.root.instance.setPassword(event)

        expect(test.root.instance.state.password).to.be.equal(event.target.value)
      })

    })

    createProjectAppAndTest(APP, state => {

      describe('submit()', () => {

        const PASS = 'password'
        const EMAIL = 'user@email.com'

        before(async () => {
          await client.connect()
          const users = await state.app.users.find({})
          if (!users.some(user => user.email === EMAIL))
            await state.app.users.create({
              email: EMAIL,
              password: PASS,
              passwordConfirm: PASS
            })

          const {
            setEmail, setPassword, submit
          } = test.root.instance

          client.host = state.address

          setEmail(EMAIL)
          setPassword(PASS)
          await submit()
        })

        it('logs in', () => {
          const { state } = test.root.instance

          expect(state.visible).to.be.equal(false)
          expect(state.status).to.be.equal(null)
          expect(client.userId).to.not.be.equal(null)
          console.warn('login component tests arn\'t complete')
        })

      })
    })
  })
})
