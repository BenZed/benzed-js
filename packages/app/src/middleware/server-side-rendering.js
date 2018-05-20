import path from 'path'
import fs from 'fs'

import { between } from '@benzed/string'

/******************************************************************************/
// Data
/******************************************************************************/

const REDIRECT = 301

const noop = () => null

/******************************************************************************/
// Helper
/******************************************************************************/

class HtmlTemplate {

  open = null
  close = null
  id = null

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

    const json = { ...props }

    // clean up things that shouldn't go client side
    if (!json.error)
      delete json.error
    else
      delete json.error.stack
    delete json.hydrated

    const cdata = Object.keys(json).length > 0
      ? `<script id='${this.id + '-serialized'}' type='application/json'>` +
          `<![CDATA[${JSON.stringify(json)}]]>` +
        `</script>`

      : ''

    const styles = sheet.getStyleTags()
    if (styles || cdata)
      open = open.replace('</head>', styles + cdata + '</head>')

    return open
  }

  constructor ({ publicDir, getComponent, serializer }) {

    const indexHtml = path.join(publicDir, 'index.html')
    if (!fs.existsSync(indexHtml))
      throw new Error(`no index.html file in public directory: ${publicDir}`)

    const indexStr = fs
      .readFileSync(indexHtml)
      .toString()

    const { open, close, id } = this.getOpenCloseAndId(indexStr)

    this.open = open
    this.close = close
    this.id = id
    this.getComponent = getComponent || noop
    this.serializer = serializer || noop
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

  handleRequest (error, req, res, next) {

    const serialized = (!error && this.serializer(req, res)) || {}
    const props = {
      hydrated: true,
      error,
      ...serialized
    }

    let context
    let ui = null

    const Component = this.getComponent(req, res)
    if (Component) {
      const React = require('react')
      const { StaticRouter } = require('react-router')

      context = {}

      ui = <StaticRouter location={req.url} context={context}>
        <Component {...props}/>
      </StaticRouter>
    }

    if (context && context.url) {
      res.writeHead(REDIRECT, { Location: context.url })
      res.end()

    } else {
      const payload = this.render(ui, props)

      if (error)
        res.status(error.code || 500)
      res.write(payload)
      res.end()
    }

  }

}

/******************************************************************************/
// Main
/******************************************************************************/

function serverSideRendering (config) {

  const template = new HtmlTemplate(config)

  // Express must count Function.length to determine a method is an Error
  // handler or not, so the handle request msut be sent back with two signatures

  const middleware = [
    (req, res, next) => template.handleRequest(null, req, res, next)
  ]

  if (config.getComponent) middleware.push(
    (err, req, res, next) => template.handleRequest(err, req, res, next)
  )

  return middleware

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default serverSideRendering
