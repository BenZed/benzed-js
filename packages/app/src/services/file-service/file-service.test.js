import { expect } from 'chai'

import App from '../../app'
import Service from '../service'
import FileService from './file-service'

import { set } from '@benzed/immutable'
import { expectReject, expectResolve } from '@benzed/dev'

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
// Data
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
        {
          name: path.basename(url),
          size: fs.statSync(url).size
        },
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

describe('File Service', () => {

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
          'storage.s3 not yet supported.'
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
  })

  const metadata = state => describe('uploaded files get metadata', () => {

    let doc, size
    before(async () => {
      const [ id, url ] = await Promise.all(state::upload(URLS.bruce))
      const stat = fs.statSync(url)
      size = stat.size
      doc = await state.app.files.get(id)
    })

    it('name', () => {
      expect(doc).to.have.property('name', 'bruce')
    })
    it('type', () => {
      expect(doc).to.have.property('type', 'image/png')
    })
    it('ext', () => {
      expect(doc).to.have.property('ext', '.png')
    })
    it('size', () => {
      expect(doc).to.have.property('size', size)
    })

  })

  const limitations = state => describe('file uploading limitations', () => {
    it('uploads must be provided with a size property')
    it('size cannot larger than the configured max')
    it('if upload exceeds given size, it is terminated')
    it('if upload is below given size, it is deleted')
    it('connections cannot upload more than configured number of concurrent files')
    it('errors are written to file record')
  })

  const serving = state => describe('serving', () => {

    let fileId
    before(async () => {
      const promises = state::upload(URLS.data)
      const [ id ] = await Promise.all(promises)

      fileId = `${id}`
    })

    it('files are served via rest', async () => {

      const res = await fetch(`${state.address}/files/${fileId}?serve=true`)
      const url = path.join(download, path.basename(URLS.data))

      if (fs.existsSync(url))
        fs.unlinkSync(url)

      const dest = fs.createWriteStream(url)
      res.body.pipe(dest)

      await new Promise((resolve, reject) => {
        dest.on('finish', resolve)
        dest.on('error', reject)
      })::expectResolve()

      expect(fs.existsSync(url)).to.be.equal(true)
    })

    it('files are only downloaded for get requests', async () => {
      const res = await fetch(`${state.address}/files/${fileId}?serve=true`, {
        method: 'post'
      })

      const json = await res.json()
      expect(json).to.have.property('code', 404)
    })

    it('files are only downloaded if $serve param is enabled', async () => {
      const res = await fetch(`${state.address}/files/${fileId}`)
      const json = await res.json()

      if (state.app.config.auth)
        expect(json).to.have.property('code', 401)
      else
        expect(json).to.have.property('_id', fileId)
    })

    it('handles partial file requests')
  })

  // createProjectAppAndTest(APP, state => {
  //
  //   before(async () => {
  //     await state.client.connect()
  //   })
  //
  //   describe('uploading to non-auth', () => {
  //
  //     metadata(state)
  //     limitations(state)
  //
  //     it('any connection can upload files', async () => {
  //       const [ id, file ] = await Promise.all(state::upload(URLS.data))
  //
  //       expect(id).to.not.be.equal(null)
  //       expect(fs.existsSync(file)).to.be.equal(true)
  //     })
  //   })
  //
  //   serving(state)
  //
  // })
  //
  // createProjectAppAndTest(APP_WITH_AUTH, state => {
  //
  //   before(async () => {
  //     await state.app::ensureUsers()
  //     await state.client.connect()
  //   })
  //
  //   describe('uploading to auth', () => {
  //
  //     let id
  //     let file
  //     before(async () => {
  //       await state.client.authenticate({ strategy: 'local', ...USERS[0] })
  //
  //       const promises = state::upload(URLS.data);
  //
  //       ([ id, file ] = await Promise.all(promises))
  //     })
  //
  //     it('user needs to be signed in to upload', async () => {
  //       await state.client.logout()
  //       const [ id ] = state::upload(URLS.data, DONT_STREAM)
  //
  //       await id::expectReject('Must be authenticated')
  //       await state.client.authenticate({ strategy: 'local', ...USERS[0] })
  //     })
  //
  //     it('signed in users can upload', () => {
  //       expect(id).to.not.equal(null)
  //       expect(fs.existsSync(file)).to.be.equal(true)
  //     })
  //
  //     it('file has user id in uploader prop', async () => {
  //       const doc = await state.app.files.get(id)
  //       const [ bob ] = await state.app.users.find({ query: { email: USERS[0].email } })
  //       expect(`${doc.uploader}`).to.be.equal(`${bob._id}`)
  //     })
  //
  //     metadata(state)
  //     limitations(state)
  //
  //   })
  //
  //   serving(state)
  // })
})
