import { spawn } from 'child_process'
import { expect } from 'chai'
import { milliseconds } from '@benzed/async'
import fetch from 'isomorphic-fetch'
import 'colors'

/* global describe it before after */

class Server {
  process = null

  stdout = []
  stderr = []

  address = `http://localhost:5100`

  constructor (projectDir) {
    this.process = spawn('npm', ['run', 'serve'], { cwd: projectDir })
    this.process.stdout.on('data', data => this.stdout.push(data.toString()))
    this.process.stderr.on('data', data => this.stderr.push(data.toString()))
  }

  async untilListening () {
    while (!this.stdout.some(log => log.includes('listening on 5100')))
      await milliseconds(100)
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

function expectServe (projectDir, options) {

  if (projectDir.includes('casino-ben') === false)
    return

  describe.only('npm run serve', function () {

    this.timeout(10000)
    this.slow(3000)

    let server
    before(() => {
      server = new Server(projectDir)
    })

    after(() => {
      if (server.process)
        server.process.kill()
    })

    it('starts listening', async () => {
      await server.untilListening()
      const res = await fetch(server.address)
      const body = await res.text()
      console.log(body.blue)
    })

  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default expectServe
