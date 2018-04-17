import Scaffold from './scaffold'
import path from 'path'
// import { expect } from 'chai'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const fakeArgv = dir => [
  'node', process.cwd(),
  '--dir', dir || path.resolve(__dirname, '../../work-dir'),
  // '--no-install'
]

describe('scaffold()', function () {
  this.slow(120000)

  it('creates a project in current or specified directory', async () => {
    // clearWorkDir()

    void await new Scaffold(fakeArgv(), {
      name: 'webpack-4-test',
      ui: false,
      api: false,
      socketio: false,
      rest: false,
      auth: false
    })

  })
})
