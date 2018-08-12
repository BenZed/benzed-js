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

    describe('creates site', () => {

      const options = {
        dir: WORK_DIR,
        name: 'test-site',

        socketio: false,
        rest: true,

        ui: true,
        api: true,

        auth: false,
        files: false
      }

      testCreateProject(options)

    })

    // const TEMP_NEW_PROJECT_NAME = 'evolution-toy'
    // describe.only(`creates ${TEMP_NEW_PROJECT_NAME}`, () => {
    //
    //   const options = {
    //     dir: path.resolve(process.cwd(), '../../../'),
    //     name: TEMP_NEW_PROJECT_NAME,
    //
    //     socketio: false,
    //     rest: false,
    //
    //     ui: true,
    //     api: false,
    //
    //     auth: false,
    //     files: false
    //   }
    //
    //   testCreateProject(options)
    //
    // })

  })

})
