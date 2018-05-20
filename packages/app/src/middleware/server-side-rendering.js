import path from 'path'
import fs from 'fs'
import is from 'is-explicit'

import { between } from '@benzed/string'

/******************************************************************************/
// Data
/******************************************************************************/

const REDIRECT = 301

/******************************************************************************/
// Helper
/******************************************************************************/

class ClientError extends Error {

  constructor (errToWrap) {
    super(errToWrap.message)
    for (const key in errToWrap)
      if (key !== 'constructor' && key !== 'stack')
        this[key] = errToWrap[key]

    delete this.stack
  }

}

class HtmlTemplate {

  open = null
  close = null
  id = null
  component = null

  getOpenCloseAndId (htmlStr) {

    const mainTag = htmlStr::between('<main', '/>')
    if (mainTag === null)
      throw new Error('index.html formatted incorrectly, main tag is not self closing or could not be found')

    const idAttr = mainTag::between(`id='`, `'`)
    if (idAttr === null)
      throw new Error('index.html formatted incorrectly, main tag does not have an id attribute.')

    const id = idAttr.replace(/(id=|')/g, '')
    if (!id)
      throw new Error('index.html formatted incorrectly, id is empty.')

    const [ open, close ] = htmlStr.split(mainTag)

    if (!open.includes('</head>'))
      throw new Error('index.html formatted incorrectly, missing </head> tag.')

    return {
      open,
      close,
      id
    }

  }

  embedStyleAndPropsIntoOpen (sheet, props) {

    let { open } = this

    const styles = sheet.getStyleTags()

    // don't serialize ssr, because when the client parses it, it should not be true
    const json = { ...props }
    delete json.ssr
    if (!json.error)
      delete json.error

    const cdata = Object.keys(json).length > 0
      ? `<script id='${this.id + '-serialized'}' type='application/json'>` +
          `<![CDATA[${JSON.stringify(json)}]]>` +
        `</script>`

      : ''

    if (styles || cdata)
      open = open.replace('</head>', styles + cdata + '</head>')

    return open
  }

  constructor (dir, component) {

    const indexHtml = path.join(dir, 'index.html')
    if (!fs.existsSync(indexHtml))
      throw new Error(`no index.html file in public directory: ${dir}`)

    const indexStr = fs
      .readFileSync(indexHtml)
      .toString()

    const { open, close, id } = this.getOpenCloseAndId(indexStr)

    this.open = open
    this.close = close
    this.id = id
    this.component = component
  }

  render (element, props) {
    const { renderToString } = require('react-dom/server')
    const { ServerStyleSheet } = require('styled-components')

    const sheet = new ServerStyleSheet()
    sheet.collectStyles(element)

    const open = this.embedStyleAndPropsIntoOpen(sheet, props)

    const { id, close } = this

    return open +
      `<main id='${id}'>` +
        renderToString(element) +
      `</main>` +
    close
  }

  handleRequest (err, req, res, next) {

    const { component } = this
    const { createElement } = require('react')
    const { StaticRouter } = require('react-router')

    const props = {
      ssr: true,
      error: err && new ClientError(err)
    }

    const ui = createElement(component, props)

    const context = {}
    const location = req.url
    const routed = createElement(StaticRouter, { location, context }, ui)

    if (context.url) {
      res.writeHead(REDIRECT, { Location: context.url })
      res.end()

    } else {
      const payload = this.render(routed, props)

      if (err)
        res.status(err.code || 500)
      res.write(payload)
      res.end()
    }

  }

}

/******************************************************************************/
// Main
/******************************************************************************/

function serverSideRendering (publicDir, routesComponent) {

  if (!is.func(routesComponent))
    throw new Error('serverSideRendering requires a React Component')

  const template = new HtmlTemplate(publicDir, routesComponent)

  return [
    // Express must count Function.length to determine a method is an Error
    // handler or not, so the handle request msut be sent back with two signatures
    (req, res, next) => template.handleRequest(null, req, res, next),

    (err, req, res, next) => template.handleRequest(err, req, res, next)

  ]
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default serverSideRendering
