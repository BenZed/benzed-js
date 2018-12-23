import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { between } from '@benzed/string'

import path from 'path'
import fs from 'fs'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Parse Html
/******************************************************************************/

const parseHtml = (html, component) => {

  const template = {}

  const htmlStr = fs.readFileSync(html, 'utf-8')

  const mainTag = htmlStr::between('<main', '/>')
  if (component && mainTag === null)
    throw new Error(
      `index.html formatted incorrectly, ` +
      `main tag is not self closing or could not be found`
    )

  const idAttr = mainTag && mainTag::between(`id='`, `'`)
  if (component && idAttr === null)
    throw new Error(
      'index.html formatted incorrectly, ' +
      'main tag does not have an id attribute.')

  const id = idAttr && idAttr.replace(/(id=|')/g, '')
  if (component && !id)
    throw new Error('index.html formatted incorrectly, id is empty.')

  const head = htmlStr::between('<head>', '</head>')
  if (!head)
    throw new Error('index.html formatted incorrectly, missing </head> tag.')

  const [ beforeHead, afterHead ] = htmlStr.split(head)
  if (!open.includes('</head>'))
    throw new Error('index.html formatted incorrectly, missing </head> tag.')

  // TODO parsing HTML

}

/******************************************************************************/
// Validation
/******************************************************************************/

const concatToCwd = url =>
  path.isAbsolute(url)
    ? url
    : path.resolve(process.cwd(), url)

const hasHtmlExt = url =>
  path.extname(url) === '.html'
    ? url
    : throw new Error(`must be an .html file`)

const exists = url =>
  fs.existsSync(url)
    ? url
    : throw new Error('must exist on the file system')

const isNotDir = url =>
  !fs.statSync(url).isDirectory()
    ? url
    : throw new Error(`must not be a directory`)

const validate = <object key='express-ui' strict>
  <string key='html'
    required
    validate={[ concatToCwd, hasHtmlExt, exists, isNotDir ]}
  />
  <string key='endpoint' default='/' />
  <func key='component' />
  <func key='serializer' />
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const expressUi = config => {

  const { html, component, endpoint, serializer } = validate(config)

  const template = parseHtml(html, component)

  return app => {

    if (!app.rest)
      throw new Error('cannot use express ui without express enabled')



  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default expressUi
