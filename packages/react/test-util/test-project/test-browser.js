import { JSDOM, VirtualConsole } from 'jsdom'
import { milliseconds } from '@benzed/async'

/******************************************************************************/
// Helper
/******************************************************************************/

async function fetchFromUrlAndCreateJsdom (url) {

  const browser = this

  const virtualConsole = new VirtualConsole()
  virtualConsole.sendTo({
    info: args => browser.logs.info.push(args),
    warn: args => browser.logs.warn.push(args),
    error: args => browser.logs.error.push(args)
  })

  const res = await fetch(url)
  const body = await res.text()

  const { window } = new JSDOM(body, {
    url,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole
  })

  browser.window = window
  browser.document = window.document
  browser.fetched = body

}

/******************************************************************************/
// Main
/******************************************************************************/

class TestBrowser {

  window = null
  document = null

  logs = {
    info: [],
    warn: [],
    error: []
  }

  async untilFetched () {
    let ms = 0
    while (this.window === null)
      ms += await milliseconds(10)

    return ms
  }

  async untilLoaded () {

    let ms = await this.untilFetched()

    while (this.window.loaded === undefined && ms < 1000)
      ms += await milliseconds(10)

    ms += await this.window.loaded

    return ms
  }

  constructor (address) {
    this::fetchFromUrlAndCreateJsdom(address)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default TestBrowser
