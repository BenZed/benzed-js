import fs from 'fs-extra'
import path from 'path'
import is from 'is-explicit'

import { Schema, type, required } from './util/schema'
import { set } from '@benzed/immutable'
import { randomBytes } from 'crypto'

// TODO Temporary, this will be moved to @benzed/schema

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

    if (!value)
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

const boolToObject = value => value === true
  ? { }
  : value === false
    ? null
    : value

const autoFill = value => {

  if (!value)
    return value

  if (!is(value.secret, String)) {
    const secret = randomBytes(48).toString('hex')
    value = set(value, 'secret', secret)
  }

  // These are the feathers defaults, but they're needed for validation elsewhere
  if (!is(value.path, String))
    value = set(value, 'path', '/authentication')

  if (!is(value.entity, String))
    value = set(value, 'entity', 'user')

  if (!is(value.service, String))
    value = set(value, 'service', 'users')

  return value
}

/******************************************************************************/
// Schemas
/******************************************************************************/

const validateConfigObject = new Schema({
  rest: [
    boolToObject,
    type.plainObject,
    {
      public: [
        type(String),
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

  auth: [
    boolToObject,
    type.plainObject,
    autoFill
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

const validateClass = app => {

  if (is(app.rest) && !is(app.rest, Function))
    throw new Error('app.socketio not configured correctly. Must be a middleware function.')

  if (is(app.socketio) && !is(app.socketio, Function))
    throw new Error('app.socketio not configured correctly. Must be a middleware function.')

  if (is(app.services)) {
    const isFunction = is(app.services, Function)
    const isFunctionArr = is.arrayOf(app.services, Function)
    if (!isFunction && !isFunctionArr)
      throw new Error('app.services not configured correctly. Must be either a function or an array of functions')
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export { validateConfig, validateMode, validateClass }
