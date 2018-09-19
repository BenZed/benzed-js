import { expect } from 'chai'

import App from '../../app'
import Service from '../service'
import FileService from './file-service'

import { set } from '@benzed/immutable'
import { expectReject } from '@benzed/dev'

import { createProjectAppAndTest } from '../../../test-util/test-project'

import is from 'is-explicit'
import path from 'path'
import fs from 'fs-extra'

import fetch from 'isomorphic-fetch'

/******************************************************************************/
// Data
/******************************************************************************/

const storage = path.resolve('./temp/file-service-test-storage')
fs.removeSync(storage)
fs.ensureDir(storage)

const download = path.resolve('./temp/file-service-test-download')
fs.removeSync(download)
fs.ensureDir(download)

const dbpath = path.resolve('./temp/file-service-test-data')
fs.removeSync(dbpath)
fs.ensureDir(dbpath)

const testFiles = path.resolve('./test/files')

/******************************************************************************/
//
/******************************************************************************/

const APP = {

  socketio: true,
  rest: true,
  port: 6218,
  logging: false,

  services: {
    files: {
      storage: {
        local: storage
      }
    }
  },

  mongodb: {
    database: 'file-service-test',
    hosts: 'localhost:6318',
    dbpath: dbpath
  }
}

const APP_WITH_AUTH = APP
  ::set('auth', {
    secret: 'consistant'
  })
  ::set(['services', 'users'], { auth: true })
  ::set(['services', 'files', 'auth'], true)
  ::set('port', 6400)

const USERS = [
  { name: 'bob', email: 'bob@gmail.com', password: 'ilikefiles' },
  { name: 'alex', email: 'alex@gmail.com', password: 'filesaregood' }
]

const URLS = {
  data: path.join(testFiles, 'data.txt'),
  bruce: path.join(testFiles, 'bruce.png'),
  tina: path.join(testFiles, 'tina.jpg')
}

const DONT_STREAM = true

/******************************************************************************/
// Helper
/******************************************************************************/

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const newApp = (path, value, err) => {

  const config = path
    ? APP::set(path, value)
    : APP

  const app = new App(config)

  return err
    ? app.initialize()::expectReject(err)
    : app.initialize().then(() => app)
}

async function ensureUsers () {

  const app = this

  // for (const name in USERS) {
  //   const login = USERS[name]
  //
  //   const [ user ] = await app.users.find({ query: { name } })
  //   if (!user)
  //     await app.users.create({ name, ...login, passwordConfirm: login.password })
  // }

  await app.users.remove(null)
  await app.users.create(USERS
    .map(u => u::set('passwordConfirm', () => u.password))
  )

}

function upload (url, dontStream) {

  const streamer = require('socket.io-stream')
  const send = streamer.createStream()

  const { app, client } = this

  let id = null

  const idPromise = new Promise((resolve, reject) => {

    streamer(client.io)
      .emit('files::upload',
        send,
        { name: path.basename(url) },
        (e, _id) => {
          if (e)
            reject(e)
          else {
            id = _id
            resolve(id)
          }
        })
  })

  const filePromise = dontStream ? null : new Promise((resolve, reject) => {
    const read = fs.createReadStream(url)
    read.pipe(send)

    send.on('finish', () => {
      const { local } = app.get(['services', 'files']).storage
      const target = path.join(local, id)

      resolve(target)
    })
    read.on('error', reject)
    send.on('error', reject)
  })

  return [ idPromise, filePromise ]

}

/******************************************************************************/
// Tests
/******************************************************************************/

describe.only('File Service', () => {

  it('subclass of Service', () => {
    expect(is.subclassOf(FileService, Service)).to.be.equal(true)
  })

  describe('app settings', () => {

    it('services.files = true uses FileService by default', async () => {
      const app = await newApp()
      expect(app.files.Service).to.be.equal(FileService)
    })
    it('rest must be enabled to serve files', () =>
      newApp('rest', false, 'File Service requires rest to be enabled.')
    )
    it('mongodb must be enabled', () =>
      newApp('mongodb', null, 'File Service requires a database.')
    )

  })

  describe('configuration', () => {

    describe('.storage', () => {

      describe('.storage.s3', () => {
        it('"s3" currently unsupported', () => newApp(
          ['services', 'files', 'storage', 's3'], 's3',
          'storage.s3 \'s3\' not yet supported.'
        ))
      })

      describe('.storage.local', () => {
        it('if local, must be a path pointing toward a folder on the file system', () =>
          newApp(
            ['services', 'files', 'storage', 'local'],
            path.join(__dirname, 'non-folder'),
            'storage.local must be an existing folder'
          ))
      })

    })

    describe('.serve', () => {

      describe('.serve.endpoint', () => {
        it('string must be at least one character long', () => newApp(
          ['services', 'files', 'serve', 'endpoint'], '',
          'serve.endpoint must not be empty.'
        ))
      })
    })
  })

  createProjectAppAndTest(APP, state => {

    describe('uploading to non-auth', () => {

      before(async () => {
        await state.client.connect()
      })

      it('any connection can upload files', async () => {
        const [ id, file ] = await Promise.all(state::upload(URLS.data))

        expect(id).to.not.be.equal(null)
        expect(fs.existsSync(file)).to.be.equal(true)
      })
      it.skip('connection cannot upload more than the configured number of concurrent files', async () => {

        state.app.set(['services', 'files', 'upload', 'numConcurrent'], 2)

        state::upload(URLS.data)
        state::upload(URLS.bruce)
        const [ tinaId ] = state::upload(URLS.tina)

        await tinaId::expectReject('You can only queue 2 uploads at a time')
      })
      it('connection cannot upload files larger than the configured max')
    })

  })

  createProjectAppAndTest(APP_WITH_AUTH, state => {

    before(async () => {
      await state.app::ensureUsers()
      await state.client.connect()
    })

    describe('uploading to auth', () => {

      it('user needs to be signed in to upload', () => {

        const [ id ] = state::upload(URLS.data, DONT_STREAM)

        return id::expectReject('Must be authenticated')
      })

      it('signed in users can upload', async () => {

        const bob = USERS[0]
        await state.client.authenticate({ strategy: 'local', ...bob })

        const promises = state::upload(URLS.data)

        const [ id, file ] = await Promise.all(promises)

        expect(id).to.not.equal(null)
        expect(fs.existsSync(file)).to.be.equal(true)
      })

      it('users cannot upload more than configured number of concurrent files')
      it('users cannot upload files larger than the configured max')

    })

  })

  createProjectAppAndTest(APP::set('port', 6219), state => {

    describe('serving', () => {
      before(() =>
        state.client.connect()
      )

      it.only('files are served via rest', async () => {
        const promises = state::upload(URLS.data)
        const [ id, file ] = await Promise.all(promises)
        const body = await fetch(`${state.address}/files/${id}?$meta=0`)
        const json = await body.json()
        console.log(json)
      })
      it('handles partial file requests')
    })

  })

})
