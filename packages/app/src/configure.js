import fs from 'fs-extra'
import path from 'path'
import is from 'is-explicit'

import { Schema, type, required } from './util/schema'

/******************************************************************************/
// Config Validators
/******************************************************************************/

function hasValidHtml () {
  return value => value
}

function trim () {
  return value => value && value.trim()
}

function notEmpty () {
  return (value, { path }) => value && value.length > 0
    ? value
    : new Error(`${path.join('.')} must not be an empty string.`)
}

function fsContainsConfigJson () {
  return (value, { args, path: errpath }) => {
    if (!value)
      return value

    const [ mode ] = args
    try {
      const jsonUrl = path.join(value, mode)

      return require(jsonUrl)

    } catch (err) {
      throw new Error(`${errpath.join('.')} does not contain a valid ${mode}.js or ${mode}.json file: ${value}`)
    }
  }
}

function fsContains (...names) {
  return (value, { path: errpath }) => {
    if (!value)
      return value

    return names
      .map(name => path.join(value, name))
      .every(url => fs.existsSync(url))
      ? value
      : new Error(`${errpath.join('.')} must contain files '${names}': ${value}`)
  }
}

function fsExists (...exts) {
  return (value, { path: errpath, original }) => {

    if (!value && !original.ui)
      return

    if (!fs.existsSync(value))
      throw new Error(`${errpath.join('.')} does not exist: ${value}`)

    if (exts.includes('directory')) {
      const stat = fs.statSync(value)
      if (!stat.isDirectory())
        throw new Error(`${errpath.join('.')} is not a directory: ${value}`)

    } else if (exts.length > 0 && !exts.some(ext => path.extname(value) === ext))
      throw new Error(`${errpath.join('.')} must be a file with extension ${exts}: ${value}`)

    return value
  }
}

/******************************************************************************/
// Schemas
/******************************************************************************/

const validateConfigObject = new Schema({
  ui: [
    type.plainObject,
    {
      public: [
        type(String),
        required(),
        fsExists('directory'),
        fsContains('index.html'),
        hasValidHtml()
      ],
      favicon: [
        type(String),
        fsExists('.png', '.jpeg', '.jpg', '.svg', '.ico')
      ]
    }
  ],

  port: [
    type(Number),
    required()
  ]
}, 'config')

const validateConfigUrl = new Schema([
  required(),
  type(String),
  notEmpty(),
  fsExists('directory'),
  fsContainsConfigJson()
], 'configUrl')

const validateConfig = (config, ...args) => {

  if (is(config, String))
    config = validateConfigUrl(config, ...args)

  if (!is.plainObject(config))
    throw new Error('must be a plain object or url')

  config = validateConfigObject(config, ...args)

  return config
}

const validateMode = new Schema([
  type(String), trim(), notEmpty()
], 'mode')

/******************************************************************************/
// Exports
/******************************************************************************/

export { validateConfig, validateMode }
