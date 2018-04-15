import path from 'path'
import { inspect } from 'util'
import fs from 'fs-extra'

/******************************************************************************/
// Data
/******************************************************************************/

const TEMPLATES_DIR = path.join(__dirname, '../templates')

const IGNORE = undefined

/******************************************************************************/
// Helper
/******************************************************************************/

const jsonFilter = (key, value) => value::hasBackSpace()
  ? IGNORE
  : value

function capitalize () {
  return this && (this.charAt(0).toUpperCase() + this.slice(1))
}

function replace$ ({ backend, projectName }) {

  const url = this

  return url
    .replace(/\$backend/g, backend)
    .replace(/\$name/g, projectName)
}

function zip (strings, ...inputs) {

  const arr = []

  for (let i = 0; i < strings.length; i++) {
    arr.push(strings[i])
    if (i < inputs.length)
      arr.push(inspect(inputs[i]))
  }

  const str = arr.join('')

  return str
}

function iff (condition) {

  if (typeof condition === 'function')
    condition = condition()

  return (strings, ...inputs) => condition
    ? zip(strings, ...inputs)
    : '\b'
}

function json (obj, spaces = 4) {

  return `${
    JSON.stringify(
      obj,
      jsonFilter,
      spaces
    )
  }`::toLines().join('\n')
}

function hasBackSpace () {
  return typeof this === 'string' && this.includes('\b')
}

function toLines () {

  const str = this

  let lastWasBlank = false

  // limit blank lines to one consecutively
  const lines = str && str.split(/\n/)
    .filter((str, i, arr) => {

      const blank = str.trim()
        .replace('\b', '') === ''

      const isBlankAndFirstLine = blank && i === 0
      const allowed = !str::hasBackSpace() &&
        !isBlankAndFirstLine &&
        !(blank && lastWasBlank)

      lastWasBlank = blank
      return allowed
    })

  return lines || null
}

/******************************************************************************/
// Main
/******************************************************************************/

class Template {

  // Helpers

  iff = iff

  json = json

  constructor (scaffold, url) {

    const { name, ...options } = scaffold.options

    const hasProvider = options.rest || options.socketio

    this.backend = options.api
      ? hasProvider
        ? 'api'
        : 'server'
      : 'test'
    this.Backend = this.backend::capitalize()

    this.frontend = options.api && options.ui
      ? hasProvider
        ? 'app'
        : 'website'

      : options.ui
        ? 'example'
        : undefined

    this.Frontend = this.backend::capitalize()

    this.has = options

    this.projectName = name
    this.projectDir = scaffold.flags.dir

    this.name = path
      .basename(url.replace(/\.jsx?$/, ''))

    this.dir = path
      .dirname(url)
      .replace(TEMPLATES_DIR, '')
      .replace(/^\//, '')

  }

  writeToFile (text) {

    if (!text)
      return

    const targetDir = path
      .join(this.projectDir, this.projectName, this.dir)
      ::replace$(this)

    const targetUrl = path
      .join(targetDir, this.name)
      ::replace$(this)

    const lines = text::toLines()

    const str = lines && lines.join('\n')

    if (str && str.trim().length > 0) {

      fs.ensureDirSync(targetDir)
      fs.writeFileSync(targetUrl, str, 'utf-8')

      return targetUrl
    }

  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Template

export { toLines }
