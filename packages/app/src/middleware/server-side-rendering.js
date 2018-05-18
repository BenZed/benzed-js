import path from 'path'
import fs from 'fs'
import { between } from '@benzed/string'

/******************************************************************************/
// Helper
/******************************************************************************/

class HtmlTemplate {

  open = '<main>'
  close = '<main/>'

  getOpenCloseAndId (htmlStr) {

    const mainTag = htmlStr::between('<main', '/>')
    if (mainTag === null)
      throw new Error('index.html formatted incorrectly, main tag could not be found.')

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

import React from 'react'
const Test = ({ ssr }) =>
  React.createElement('h1', {}, [ssr ? 'was rendered serverside' : 'was not rendered serverside'])

/******************************************************************************/
// Main
/******************************************************************************/

function serverSideRendering (publicDir, routing, UiComponent = Test) {

  // TODO check args

  const template = new HtmlTemplate(publicDir)

  const { createElement } = require('react')

  const StaticRouter = routing
    ? require('react-router').StaticRouter
    : null

  return (req, res) => {

    let ui = createElement(UiComponent, { ssr: true })

    const context = {}

    if (routing) {
      const location = req.url
      ui = createElement(StaticRouter, { location, context }, ui)
    }

    if (routing && context.url) {
      res.writeHead(301, { Location: context.url })
      res.end()

    } else {
      const payload = template.render(ui)

      console.log(payload)

      res.write(payload)
      res.end()
    }

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default serverSideRendering
