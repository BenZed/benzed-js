import { spawn } from 'child_process'
import { expect } from 'chai'
import { until } from '@benzed/async'
import { expectResolve } from '../../src/test-util'
import fetch from 'isomorphic-fetch'
import TestBrowser from './test-browser'

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

  untilListening (timeout = 3000) {
    return until({
      condition: () => this.stdout.some(log => log.includes('listening on 5100')),
      err: `App did not start listening within ${timeout} ms`,
      timeout
    })
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

function expectServe (projectDir, options) {

  describe('npm run serve', function () {

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

    it('starts listening', function () {
      // TEMP not a good test, because only apps that serve a ui will return html
      return server.untilListening(2000)::expectResolve()
    })

    if (options.ui)
      describe('serves a ui', () => {

        let browser
        before(async () => {
          await server.untilListening()
          browser = new TestBrowser(server.address)
          await browser.untilFetched()
        })

        it('serves static assets', async () => {
          const res = await fetch(server.address + `/${options.name}.css`)
          const css = await res.text()
          expect(css).to.include('normalize.css')

          const res2 = await fetch(server.address + `/4.js`)
          const js = await res2.text()
          expect(js).to.include('* react.production.min.js')
        })

        it('gets index.html markup from server', () => {
          expect(browser.fetched).to.include(`<main id='${options.name}'`)
        })

      })
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default expectServe
