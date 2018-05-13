import path from 'path'
import fs from 'fs'

/******************************************************************************/
// Helper
/******************************************************************************/

class HtmlTemplate {

  open = '<main>'
  close = '<main/>'

  constructor (dir) {

    const indexHtml = path.join(dir, 'index.html')
    const indexLines = fs
      .readFileSync(indexHtml, 'utf-8')
      .split('\n')

    // TODO FINISH TURNING INDEX.HTML INTO A TEMPLATE

  }

  render (ui) {
    const { renderToString } = require('react-dom/server')

    return this.open + renderToString(ui) + this.close
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

function serverSideRendering (publicDir, routing, UiComponent) {

  // TODO check args

  const template = new HtmlTemplate(publicDir)

  const { createElement } = require('react')

  const StaticRouter = routing
    ? require('react-router').StaticRouter
    : null

  return (req, res) => {

    let ui = createElement(UiComponent, { static: true })

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

      res.write(payload)
      res.end()
    }

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default serverSideRendering
