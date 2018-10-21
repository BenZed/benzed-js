import path from 'path'
import fs from 'fs'
import is from 'is-explicit'

import { copy } from '@benzed/immutable'
import { between } from '@benzed/string'
import { createValidator } from '@benzed/schema' // eslint-disable-line no-unused-vars

// @jsx createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const REDIRECT = 301

const UNFETCHED = Symbol('not-yet-fetched')

const noop = () => null

/******************************************************************************/
// Validation
/******************************************************************************/

const mustHaveIndexHtml = publicDir => {
  const indexHtml = path.join(publicDir, 'index.html')

  if (!fs.existsSync(indexHtml))
    throw new Error(`Missing index.html file: ${publicDir}`)

  return publicDir
}

const validateConfig = <object>
  <string key='publicDir' required validate={mustHaveIndexHtml} />
  <func key='getComponent' />
  <func key='serializer' />
</object>

/******************************************************************************/
// HtmlTemplate
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

  embedStyleAndPropsIntoOpen (styles, props) {

    let { open } = this

    const json = { ...props }

    // clean up things that shouldn't go client side
    if (!json.error)
      delete json.error
    else
      delete json.error.stack
    delete json.hydrated

    const cdata = Object.keys(json).length > 0
      ? `<script id='${this.id + '-server-props'}' type='application/json'>` +
          JSON.stringify(json) +
        `</script>`

      : ''

    if (styles || cdata)
      open = open.replace('</head>', styles + cdata + '</head>')

    return open
  }

  constructor (config) {

    const { publicDir, getComponent, serializer } = validateConfig(config)
    if (!getComponent && !serializer)
      throw new Error('Either getComponent or serializer must be defined.')

    const indexHtml = path.join(publicDir, 'index.html')
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

    let reacted = ''
    let styles = ''
    if (element) {
      const sheet = new ServerStyleSheet()
      reacted = renderToString(
        sheet.collectStyles(element)
      )
      styles = sheet.getStyleTags()
    }

    const open = this.embedStyleAndPropsIntoOpen(styles, props)

    const { id, close } = this

    return open +
      `<main id='${id}'>` +
        reacted +
      `</main>` +
    close
  }

  handleRequest (error, req, res, { serialized, Component }) {

    if (serialized === UNFETCHED && !error)
      serialized = this.serializer(req, res)

    if (is(serialized, Promise))
      return serialized.then(serialized =>
        this.handleRequest(error, req, res, { serialized, Component })
      )

    if (!is.plainObject(serialized))
      serialized = {}

    const props = {
      hydrated: true,
      error,
      ...serialized
    }

    let context
    let ui = null

    if (Component === UNFETCHED)
      Component = this.getComponent(req, res)

    if (is(Component, Promise))
      return Component.then(Component =>
        this.handleRequest(error, req, res, { serialized, Component })
      )

    if (is.func(Component)) {
      const React = require('react')
      const { StaticRouter } = require('react-router')

      context = {}

      ui = React.createElement(StaticRouter, { location: req.url, context },
        React.createElement(Component, props)
      )

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

  initHandleRequestState = {
    serialized: UNFETCHED,
    Component: UNFETCHED
  }::copy

}

/******************************************************************************/
// Main
/******************************************************************************/

function serverSideRendering (config) {

  const template = new HtmlTemplate(config)

  // Express must count Function.length to determine a method is an Error
  // handler or not, so the handle request msut be sent back with two signatures

  const middleware = [
    (req, res, next) => template.handleRequest(
      null,
      req,
      res,
      template.initHandleRequestState()
    )
  ]

  if (config.getComponent) middleware.push(
    (err, req, res, next) => template.handleRequest(
      err,
      req,
      res,
      template.initHandleRequestState()
    )
  )

  return middleware

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default serverSideRendering
