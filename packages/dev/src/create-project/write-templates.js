import path from 'path'
import fs from 'fs-extra'
import is from 'is-explicit'

import { push, unique } from '@benzed/immutable'

/******************************************************************************/
// Data
/******************************************************************************/

const TEMPLATES_DIR = path.join(__dirname, './templates')

const SKIP_LINE = '@benzed-skip-line'

/******************************************************************************/
// Helper
/******************************************************************************/

// Prevents undefined values from making it to the final JSON
const stringifyNoUndef = (k, v) => v instanceof Array
  ? v.filter(i => i !== undefined)
  : v

function lineIf (condition) {

  if (typeof condition === 'function')
    condition = condition()

  return (strings, ...params) => condition
    ? prettifyString(strings, ...params)
    : SKIP_LINE
}

function prettifyString (strings, ...params) {
  let str = ''

  for (let i = 0; i < strings.length; i++) {
    const string = strings[i]
    str += string

    if (i >= params.length)
      continue

    // falsy values don't get added
    const param = params[i]
    if (!param)
      continue

    str += param
  }

  const lines = str.split('\n')
    // Remove blank first line
    .filter((line, i) => i > 0 || line.trim().length > 0)
    // Remove skip line
    .filter(line => !line.includes(SKIP_LINE))

  str = lines.join('\n')

  // Remove duplicate spaces
  while (/\n\n\n/.test(str))
    str = str.replace(/\n\n\n/, '\n\n')

  return str
}

/******************************************************************************/
// Main
/******************************************************************************/

function writeToProject (text, templateUrl) {

  const context = this

  let urlInProject = templateUrl
    .replace(
      TEMPLATES_DIR,
      context.projectDir
    )
    .replace(/\.js$/, '')

  const ext = path.extname(urlInProject)
  let name = path.basename(urlInProject, ext)
  const dir = path.dirname(urlInProject)

  if (/^\$/.test(name)) {

    const key = name.replace('$', '')
    name = context.options[key] || context[key]

  }

  if (/^\*/.test(name))
    name = name.replace('*', '.')

  urlInProject = path.join(dir, name + ext)

  fs.ensureFileSync(urlInProject)
  fs.writeFileSync(urlInProject, text)
  context.writtenFiles.push(urlInProject)
}

function addDependencies (deps, options) {

  if (deps instanceof Function)
    deps = deps(options)

  if (deps instanceof Array === false)
    deps = []

  deps = deps.filter(d => typeof d === 'string')

  return this
    ::push(...deps)
    ::unique()
}

function writeTemplate (templateUrl) {

  const context = this
  const {
    default: getText,
    dependencies,
    devDependencies
  } = require(templateUrl)

  const { frontend, backend, type } = context

  let text = getText({
    frontend,
    backend,
    type,
    ...context.options,
    pretty: prettifyString,
    iff: lineIf
  })

  if (is.plainObject(text))
    text = JSON.stringify(text, stringifyNoUndef, 2)

  if (text)
    context::writeToProject(text, templateUrl)

  context.dependencies = context.dependencies::addDependencies(dependencies, context.options)
  context.devDependencies = context.devDependencies::addDependencies(devDependencies, context.options)

}

function writeTemplates (dir = TEMPLATES_DIR) {

  const context = this
  if (typeof context !== 'object' || context === null)
    throw new Error('writeTemplates needs to be bound to a context')

  const urls = fs
    .readdirSync(dir)
    .filter(name => !/\.test\.js/.test(name))
    .map(name => path.join(dir, name))

  for (const url of urls)

    if (fs.statSync(url).isDirectory())
      context::writeTemplates(url)

    else
      context::writeTemplate(url)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default writeTemplates
