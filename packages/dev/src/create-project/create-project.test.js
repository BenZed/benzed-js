import { expect } from 'chai'
import testCreateProject from 'test/test-create-project'
import path from 'path'
import fs from 'fs-extra'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Data
/******************************************************************************/

const WORK_DIR = path.resolve(
  __dirname,
  '../../test/create-project'
)

fs.ensureDirSync(
  WORK_DIR
)

// const fakeArgs = dir => [
//   'node', 'benzed-create', // needs two or else args package breaks
//   `--dir`, `${dir || WORK_DIR}`
// ]

/******************************************************************************/
// Test
/******************************************************************************/

describe('createProject()', () => {

  it('is a function', () => {
    expect(testCreateProject).to.be.instanceof(Function)
  })

  describe('input', () => {
    it('array of strings (argv)')
    it('plain object')
    it('otherwise throws')
  })

  describe('options', () => {

    describe('dir', () => {
      it('must be a path')
      it('throws if dir does not exist')
    })

    it('name')
    it('api')
    it('socketio')
    it('rest')
    it('auth')
    it('files')
    it('ui')

  })

  describe('usage', () => {

    describe('creates libraries', () => {

      const options = {
        dir: WORK_DIR,
        name: 'test-lib',

        socketio: false,
        rest: false,

        ui: false,
        api: false,

        auth: false,
        files: false
      }

      testCreateProject(options)

    })

    describe('creates apis', () => {

      const options = {
        dir: WORK_DIR,
        name: 'test-api',

        socketio: true,
        rest: false,

        ui: false,
        api: true,

        auth: false,
        files: false
      }

      testCreateProject(options)

    })

    describe('creates app', () => {

      const options = {
        dir: WORK_DIR,
        name: 'test-app',

        socketio: true,
        rest: false,

        ui: true,
        api: true,

        auth: false,
        files: false
      }

      testCreateProject(options)

    })

    describe('creates boss-media-www', function () {
      this.timeout(50000)

      const dir = path.resolve(process.cwd(), '../../../')

      const options = {
        dir: dir,
        name: 'boss-media-www',

        socketio: false,
        rest: true,

        ui: true,
        api: true,

        auth: false,
        files: false,
        routing: true
      }

      testCreateProject(options)

    })

    describe('creates casino ben', function () {
      this.timeout(50000)

      const dir = path.resolve(process.cwd(), '../../../')

      // fs.removeSync(path.join(dir, 'casino-ben'))

      const options = {
        dir: dir,
        name: 'casino-ben',

        socketio: true,
        rest: true,

        ui: true,
        api: true,

        auth: true,
        files: true,

        routing: true
      }

      testCreateProject(options)
    })

  })

})
