import { expect } from 'chai'
import createProject from './create-project'
import path from 'path'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Data
/******************************************************************************/

const WORK_DIR = path.resolve(__dirname, '../../test/work')

/******************************************************************************/
// Helper
/******************************************************************************/

const fakeArgs = dir => [
  '--dir', dir || WORK_DIR
]

/******************************************************************************/
// Test
/******************************************************************************/

describe('createProject()', () => {

  it('is a function', () => {
    expect(createProject).to.be.instanceof(Function)
  })

  describe('arguments', () => {

    createProject(fakeArgs(), {
      name: 'test',
      socketio: true,
      ui: false,
      api: false,
      rest: false,
      auth: false
    })

  })

})
