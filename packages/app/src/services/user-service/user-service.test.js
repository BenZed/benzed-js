import { expect } from 'chai'
import UserService from './user-service'

import { expectReject } from '@benzed/dev'

import { createProjectAppAndTest } from '../../../test-util/test-project'

import is from 'is-explicit'
import path from 'path'
import fs from 'fs-extra'

/******************************************************************************/
// Data
/******************************************************************************/

const dbpath = path.resolve('./temp/file-service-test-data')
fs.removeSync(dbpath)
fs.ensureDir(dbpath)

const APP = {
  rest: true,
  socketio: true,

  port: 4718,
  logging: false,
  auth: true,

  services: {
    users: true
  },

  mongodb: {
    database: 'file-service-test',
    hosts: 'localhost:6318',
    dbpath: dbpath
  }
}

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('UserService', () => {

  it('is a class', () => {
    expect(() => UserService()).to.throw('invoked without \'new\'')
  })

  createProjectAppAndTest(APP, state => {

    describe('app configuration', () => {
      it('configuring services.users in an auth app uses UserService class by default', () => {
        expect(state.app.users.Service).to.be.equal(UserService)
      })
    })

    describe('usage', () => {

      before(() =>
        state.app.users.remove(null)
      )

      it('adds password validation hooks', async () => {
        await state.app.users.create({
          name: 'Jean',
          password: 'six'
        })::expectReject('Password mismatch')

        await state.app.users.create({
          name: 'James',
          password: 'six',
          passwordConfirm: 'six'
        })::expectReject('Password invalid')
      })
      it('adds password hash hooks', async () => {

        const user = await state.app.users.create({
          name: 'Chirabooty',
          email: 'chira@gmail.com',
          password: 'password',
          passwordConfirm: 'password'
        })

        expect(user.password).to.not.be.equal(null)
        expect(user.password).to.not.be.equal('password')
      })
      it('adds password remove hooks', async () => {
        const password = 'this-is-a-password'

        const roger = await state.app.users.create({
          name: 'Roger',
          email: 'roger@gmail.com',
          password,
          passwordConfirm: password
        })

        await state.client.connect()
        await state.client.authenticate({
          strategy: 'local',
          email: roger.email,
          password
        })

        const clientRoger = await state.client.service('users').get(`${roger._id}`)

        expect(clientRoger).to.not.have.property('password')
      })
    })
  })
})
