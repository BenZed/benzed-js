import path from 'path'
import fs from 'fs-extra'
import is from 'is-explicit'

import { push, unique } from '@benzed/immutable'

/******************************************************************************/
// Data
/******************************************************************************/

const TEMPLATES_DIR = path.join(__dirname, './templates')

/******************************************************************************/
// Helper
/******************************************************************************/

// Prevents undefined values from making it to the final JSON
const stringifyNoUndef = (k, v) => v instanceof Array
  ? v.filter(i => i !== undefined)
  : v

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

  return lines.join('\n')
}

/******************************************************************************/
// Main
/******************************************************************************/

function writeToProject (text, templateUrl, namer) {

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

  if (namer instanceof Function)
    namer = namer(context.options)

  if (typeof namer === 'string')
    name = namer

  else if (/^\$/.test(name)) {

    const key = name.replace('$', '')
    name = context.options[key] || context[key]

  }

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
    default: getText, dependencies, devDependencies
  } = require(templateUrl)

  const { frontend, backend, type } = context

  let text = getText({
    frontend,
    backend,
    type,
    ...context.options,
    pretty: prettifyString
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
