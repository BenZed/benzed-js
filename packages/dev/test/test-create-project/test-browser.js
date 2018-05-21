import { JSDOM, VirtualConsole } from 'jsdom'
import { until } from '@benzed/async'
import fetch from 'isomorphic-fetch'

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
  fetched = null

  logs = {
    info: [],
    warn: [],
    error: []
  }

  untilLogsContain ({ content, type = 'info', ...untilConfig }) {

    const logs = this.logs[type]

    return until({
      ...untilConfig,
      condition: () => logs.some(log => log.includes(content))
    })
  }

  untilFetched (untilConfig = {}) {
    return until({
      ...untilConfig,
      condition: () => this.fetched !== null
    })
  }

  constructor (address) {
    this::fetchFromUrlAndCreateJsdom(address)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default TestBrowser
