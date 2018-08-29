import { expect } from 'chai'

import App from '../app'
import Service from './service'
import FileService from './file-service'

import { set } from '@benzed/immutable'
import { createProjectAppAndTest } from '../../test-util/test-project'

import is from 'is-explicit'

const APP = {

  socketio: true,
  rest: true,
  port: 6218,

  services: {
    files: true
  }

}

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('File Service', () => {

  it('subclass of Service', () => {
    expect(is.subclassOf(FileService, Service)).to.be.equal(true)
  })

  describe('configuration', () => {

    it('services.files = true uses FileService by default', async () => {

      const app = new App(APP)

      await app.initialize()
      expect(app.files.Service).to.be.equal(FileService)

    })

    it.skip('rest must be enabled to serve files', () => {
      expect(() => new App(APP::set('rest', false)))
        .to
        .throw('rest must be enabled to serve files')
    })

  })

  createProjectAppAndTest(APP, state => {

    describe('file storage', () => {})

  })

})
