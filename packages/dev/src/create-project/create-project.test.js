import { expect } from 'chai'
import createProject from './create-project'
import path from 'path'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Data
/******************************************************************************/

const WORK_DIR = path.resolve(__dirname, '../../test/create-project')

/******************************************************************************/
// Helper
/******************************************************************************/

const fakeArgs = dir => [
  'node', 'benzed-create', // needs two or else args package breaks
  `--dir`, `${dir || WORK_DIR}`
]

/******************************************************************************/
// Test
/******************************************************************************/

describe.only('createProject()', () => {

  it('is a function', () => {
    expect(createProject).to.be.instanceof(Function)
  })

  describe('input', () => {

    it('dir', () => {
      createProject({
        dir: WORK_DIR,
        name: 'test',
        socketio: false,
        rest: false,
        ui: false,
        api: false,
        auth: false,
        files: false
      })
    })

    describe('array of strings (argv)')

    describe('plain object')

    describe('undefined')

  })

  describe('options', () => {

    describe('dir')
    describe('name')
    describe('api')
    describe('socketio')
    describe('rest')
    describe('auth')
    describe('files')
    describe('ui')

  })

})
