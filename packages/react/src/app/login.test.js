import { expect } from 'chai'
import Login from './login'
import is from 'is-explicit'

import React from 'react'
import renderer from 'react-test-renderer'
import ClientStore from './store/client-store'

import path from 'path'
import fs from 'fs-extra'

import { createProjectAppAndTest } from '@benzed/app/test-util/test-project'

/******************************************************************************/
// TODO Move me to @benzed/dev
/******************************************************************************/

function testPropTypes (Component, tests) {

  describe(`testing propTypes for ${Component.name}`, () => {
    let propTypes
    before(() => {
      propTypes = Component && Component.propTypes
    })

    it(`proptypes is defined for component ${Component.name}`, () => {
      expect(is.objectOf.func(propTypes)).to.be.equal(true)
    })

    if (!is.func(tests))
      return

    const expectError = props => {

      if (!is.object(props))
        throw new Error('props must be an object')

      for (const propName in propTypes) {
        const result = propTypes[propName](props, propName, Component.name)
        if (result instanceof Error)
          return expect(result.message)
      }

      return expect(null)
    }

    tests(expectError)
  })

}

/******************************************************************************/
// Helper
/******************************************************************************/

const DB_PATH = path.resolve(__dirname, '../../temp/login-component-test-db')

const PORT = 5890

const APP = {
  auth: true,
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

  testPropTypes(Login, expectError => {
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

    let client, SUBSCRIBERS
    before(() => {
      client = createClientStore()
      SUBSCRIBERS = Object
        .getOwnPropertySymbols(client)
        .filter(sym => String(sym).includes('subscribers'))[0]
    })

    it('subscribes to client store on mount', () => {

      const test = renderer.create(
        <Login client={client} />
      )

      const { onAuthenticate } = test.root.instance
      const subFuncs = client[SUBSCRIBERS].map(sub => sub.func)

      expect(subFuncs).to.include(onAuthenticate)

    })

    it('unsubscribes from store on dismount', () => {
      const tree = renderer.create(
        <Login client={client} />
      )

      const { onAuthenticate } = tree.root.instance

      tree.unmount()

      const subFuncs = client[SUBSCRIBERS].map(sub => sub.func)
      expect(subFuncs).to.not.include(onAuthenticate)
    })

    it('sets state on client store error change', () => {

      const tree = renderer.create(
        <Login client={client} />
      )

      const error = 'This is an error'

      client.set(['auth', 'error'], 'This is an error')

      expect(tree.root.instance.state.error).to.be.equal(error)
    })

    createProjectAppAndTest(APP, state => {

      describe('usage', () => {

        before(async () => {
          await client.connect()
        })

        it('logs in', () => {
          const tree = renderer.create(
            <Login client={client} />
          )
          const { setEmail, setPassword, submit } = tree.root.instance

          console.log(setEmail, setPassword, submit)

        })
      })
    })
  })
})
