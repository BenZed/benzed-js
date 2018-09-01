import { expect } from 'chai'

import App from '../app'
import Service from './service'
import FileService from './file-service'

import { set } from '@benzed/immutable'
import { expectReject } from '@benzed/dev'

import { createProjectAppAndTest } from '../../test-util/test-project'

import is from 'is-explicit'
import path from 'path'
import fs from 'fs-extra'

/******************************************************************************/
// Data
/******************************************************************************/

const storage = path.resolve('./temp/file-service-test-storage')
fs.removeSync(storage)
fs.ensureDir(storage)

const APP = {

  socketio: true,
  rest: true,
  port: 6218,

  services: {
    files: {
      storage: {
        type: 'local',
        location: storage
      }
    }
  }

}

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

  })

  describe('configuration', () => {

    describe('.storage', () => {

      it('required object', () => newApp(
        ['services', 'files', 'storage'], null,
        'storage object is required.'
      ))

      describe('.storage.type', () => {

        it('required', () => newApp(
          ['services', 'files', 'storage', 'type'], null,
          'storage.type is Required.'
        ))

        it('one of: "local" or "s3"', () => newApp(
          ['services', 'files', 'storage', 'type'], 'boga',
          'Must be one of: local, s3'
        ))

        it('"s3" currently unsupported', () => newApp(
          ['services', 'files', 'storage', 'type'], 's3',
          'storage.type \'s3\' not yet supported.'
        ))

      })

      describe('.storage.location', () => {
        it('if local, must be a path pointing toward a folder on the file system', () =>
          newApp(
            ['services', 'files', 'storage', 'location'],
            path.join(__dirname, 'non-folder'),
            'storage.location must be an existing folder'
          ))
      })

    })
  })
})
