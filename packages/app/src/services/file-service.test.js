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
        location: ''
      }
    }
  }

}

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('File Service', () => {

  it('subclass of Service', () => {
    expect(is.subclassOf(FileService, Service)).to.be.equal(true)
  })

  describe('app settings', () => {

    it('services.files = true uses FileService by default', async () => {

      const app = new App(APP)

      await app.initialize()
      expect(app.files.Service).to.be.equal(FileService)

    })

    it('rest must be enabled to serve files', () => {

      const app = new App(APP::set('rest', false))

      return app
        .initialize()
        ::expectReject('File Service requires rest to be enabled.')
    })

  })

  describe('configuration', () => {

    it('requires .storage object', () => {
      return new App(
        APP::set(['services', 'files', 'storage'], null)
      ).initialize()
      ::expectReject('storage object is required.')
    })

  })

  // createProjectAppAndTest(APP, state => {
  //
  //   describe('file storage', () => {})
  //
  // })

})
