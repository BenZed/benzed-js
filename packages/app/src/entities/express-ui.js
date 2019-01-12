import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { between } from '@benzed/string'

import path from 'path'
import fs from 'fs'
import is from 'is-explicit'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const $$unserialized = Symbol('user-props-have-not-yet-been-serialized')

const REDIRECT = 301

/******************************************************************************/
// Helper
/******************************************************************************/

const sanitizeError = error => {

  const json = {}

  for (const key of Object.getOwnPropertyNames(error))
    if (key !== 'stack')
      json[key] = error[key]

  return json
}

/******************************************************************************/
// HTML Template
/******************************************************************************/

class HtmlTemplate {

  open = null
  close = null

  component = null

  constructor (html, component, serialize) {

    const htmlStr = fs.readFileSync(html, 'utf-8')

    const mainTag = htmlStr::between('<main', '/>')
    if (component && mainTag === null)
      throw new Error(
        `index.html formatted incorrectly, ` +
        `main tag is not self closing or could not be found`
      )

    const idAttr = mainTag && mainTag::between('id=\'', '\'')
    if (component && idAttr === null)
      throw new Error(
        'index.html formatted incorrectly, ' +
        'main tag does not have an id attribute.')

    const id = idAttr && idAttr.replace(/(id=|')/g, '')
    if (component && !id)
      throw new Error('index.html formatted incorrectly, id is empty.')

    const [ open, close ] = htmlStr.split(mainTag)
    if (!open.includes('</head>'))
      throw new Error('index.html formatted incorrectly, missing </head> tag.')

    this.id = id
    this.open = open
    this.close = close

    this.component = component
    this.serialize = serialize

  }

  openTagWithStyleAndProps (styles, props) {

    let { open } = this

    const json = { ...props }

    // clean up things that shouldn't go client side
    delete json.hydrated

    if (!json.error)
      delete json.error
    else
      json.error = sanitizeError(json.error)

    const cdata = Object.keys(json).length > 0
      ? `  <script id='${this.id + '-serialized'}' type='application/json'>` +
          JSON.stringify(json) +
        `</script>\n  `

      : ''

    if (styles || cdata)
      open = open.replace('</head>', styles + cdata + '</head>')

    return open
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
      const tags = sheet.getStyleTags()

      const hasAtLeastOneTag = !tags.includes('></style')
      if (hasAtLeastOneTag)
        styles = tags
    }

    const open = this.openTagWithStyleAndProps(styles, props)

    const { id, close } = this

    return open +
      `<main id='${id}'>` +
        reacted +
      `</main>` +
    close
  }

  serve (error, req, res, serialized = $$unserialized) {

    if (serialized === $$unserialized && !error)
      serialized = this.serialize && this.serialize(req, res)

    if (is(serialized, Promise))
      return serialized.then(serialized =>
        this.serve(null, req, res, serialized)
      )

    if (!is.plainObject(serialized))
      serialized = {}

    const props = {
      ...serialized,
      hydrated: true,
      error
    }

    let context
    let ui = null

    if (this.component) {
      const React = require('react')
      const { StaticRouter } = require('react-router')

      context = {}

      ui = React.createElement(StaticRouter, { location: req.url, context },
        React.createElement(this.component, props)
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

}

/******************************************************************************/
// Validation
/******************************************************************************/

const concatToCwd = url =>
  path.isAbsolute(url)
    ? url
    : path.resolve(process.cwd(), url)

const isHtml = url => {
  return path.extname(url) === '.html'
    ? url
    : throw new Error('must be an .html file')
}

const exists = url =>
  fs.existsSync(url)
    ? url
    : throw new Error(`must exist on the file system: ${url}`)

const isDir = url =>
  fs.statSync(url).isDirectory()
    ? url
    : throw new Error(`must not be a directory`)

const validate = <object key='express-ui' strict>
  <string key='public'
    required
    validate={[ concatToCwd, exists, isDir ]}
  />
  <string key='html'
    required
    default={ctx => path.join(ctx.value.public, 'index.html')}
    validate={[ concatToCwd, exists, isHtml ]}
  />
  <func key='serialize' />
  <any key='component' validate={value =>
    !is.defined(value) || is.func(value) || (is.object(value) && is.func(value.render))
      ? value
      : throw new Error('must be a react component or stateless component')
  } />
  {/* <bool key='componentUsesStyles' />
  <bool key='componentUsesRouting' />
  <bool key='componentConsumesErrors' /> */}
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const expressUi = config => {

  const { public: _public, html, component, serialize } = validate(config)

  const template = new HtmlTemplate(html, component, serialize)

  return app => {

    if (!app.rest)
      throw new Error('cannot use express ui without express enabled')

    const express = require('@feathersjs/express')

    app.use(express.static(_public, { index: false }))

    // wrapped because express requires argument counts to delineate between
    // middleware and error handlers
    app.use((req, res, next) =>
      template.serve(null, req, res)
    )

    if (component) app.use((err, req, res, next) =>
      template.serve(err, req, res)
    )

  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default expressUi
