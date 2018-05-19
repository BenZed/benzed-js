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

class HtmlTemplate {

  open = null
  close = null

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

  constructor (dir) {

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
  }

  render (element) {
    const { renderToString } = require('react-dom/server')
    const { ServerStyleSheet } = require('styled-components')

    const sheet = new ServerStyleSheet()
    sheet.collectStyles(element)

    const open = this.open.replace('</head>', sheet.getStyleTags() + '</head>')
    const { id, close } = this

    return open +
      `<main id='${id}'>` +
        renderToString(element) +
      `</main>` +
    close
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

function serverSideRendering (publicDir, RoutesComponent) {

  if (!is.func(RoutesComponent))
    throw new Error('serverSideRendering requires a React Component')

  const template = new HtmlTemplate(publicDir)

  const { createElement } = require('react')
  const { StaticRouter } = require('react-router')

  return (req, res) => {

    const ui = createElement(RoutesComponent, { ssr: true })

    const context = {}
    const location = req.url
    const routed = createElement(StaticRouter, { location, context }, ui)

    if (context.url) {
      res.writeHead(REDIRECT, { Location: context.url })
      res.end()

    } else {
      const payload = template.render(routed)

      res.write(payload)
      res.end()
    }
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default serverSideRendering
