import fs from 'fs-extra'
import path from 'path'
import is from 'is-explicit'

import { Schema, cast,
  object, arrayOf, string, bool, number,
  required, length, format, defaultTo
} from '@benzed/schema'
import { get, set } from '@benzed/immutable'
import { randomBytes } from 'crypto'

/******************************************************************************/
// Helper
/******************************************************************************/

function isEnabled (value) {

  return value === true || (is.plainObject(value) && value.enabled !== false)

}

/******************************************************************************/
// Config Validators
/******************************************************************************/

// TODO Temporary, this will be moved to @benzed/schema

function trim (value) {
  return value && value.trim()
}

function notEmpty (value) {
  return value && value.length > 0
    ? value
    : new Error(`must not be an empty string.`)
}

function fsContainsConfigJson (value, { args }) {

  if (!value)
    return value

  const [ mode ] = args
  try {
    const jsonUrl = path.join(value, mode)

    return require(jsonUrl)

  } catch (err) {
    throw new Error(`does not contain a valid ${mode}.js or ${mode}.json file: ${value}`)
  }

}

function fsContains (...names) {
  return (value, ctx) => {

    if (!value)
      return value

    return names
      .map(name => path.join(value, name))
      .every(url => fs.existsSync(url))
      ? value
      : new Error(`must contain files '${names}': ${value}`)
  }
}

function fsExists (...exts) {
  return (value, { original }) => {

    if (!value)
      return

    if (!fs.existsSync(value))
      throw new Error(`does not exist: ${value}`)

    if (exts.length === 0) {
      const stat = fs.statSync(value)
      if (!stat.isDirectory())
        throw new Error(`is not a directory: ${value}`)

    } else if (exts.length > 0 && !exts.some(ext => path.extname(value) === ext))
      throw new Error(`must be a file with extension ${exts}: ${value}`)

    return value
  }
}

function requiredIfNo (other) {

  return (value, ctx) => value == null && !get(ctx.data, other)
    ? new Error(`required if ${other} is disabled.`)
    : value
}

function requiredIf (other) {

  return (value, ctx) => value == null && get(ctx.data, other)
    ? new Error(`required if ${other} is enabled.`)
    : value
}

const boolToObject = value =>
  value === true
    ? { }
    : value === false
      ? null
      : value

const eachKeyMustBeObject = value => {

  if (value == null)
    return value

  for (const key in value)
    value[key] = boolToObject(value[key])

  for (const key in value)
    if (value[key] !== null && !is.plainObject(value[key]))
      return new Error('must be comprised of objects')

  return value
}

const autoFillAuth = value => {

  if (!is.plainObject(value))
    return value

  if (!is.string(value.secret)) {
    const secret = randomBytes(48).toString('hex')
    value = set(value, 'secret', secret)
  }

  // These are the feathers defaults, but they're needed for validation elsewhere
  if (!is.string(value.path))
    value = set(value, 'path', '/authentication')

  if (!is.string(value.entity))
    value = set(value, 'entity', 'user')

  if (!is.string(value.service))
    value = set(value, 'service', 'users')

  return value
}

const fixPathOrEnv = value => {

  const isEnvVariableName = /^([A-Z]|_)+$/.test(value)
  if (isEnvVariableName)
    return process.env[value]

  const isRelativePath = /^\.\.?\//.test(value)
  if (isRelativePath)
    return path.join(process.cwd(), value)

  return value
}

const finishPathsAndLinkToEnv = value => {

  if (!is.plainObject(value))
    return value

  for (const key in value) {
    if (is.plainObject(value[key]))
      value[key] = finishPathsAndLinkToEnv(value[key])

    if (!is.string(value[key]))
      continue

    value[key] = fixPathOrEnv(value[key])

  }

  return value
}

/******************************************************************************/
// Defaults
/******************************************************************************/

const dataDbDir = () => {

  const cwd = process.cwd()
  const fsRoot = path.parse(cwd).root

  return path.join(fsRoot, 'data', 'db')
}

/******************************************************************************/
// Schemas
/******************************************************************************/

const ALLOW_ARBITRARY_KEYS = false
const validateConfigObject = Schema(
  {

    rest: object(
      ALLOW_ARBITRARY_KEYS,
      cast(boolToObject),
      requiredIfNo('socketio'),
      {
        public: string(
          fsExists(),
          fsContains('index.html')
        )
      }
    ),

    socketio: object(
      cast(boolToObject),
      requiredIfNo('rest')
    ),

    mongodb: object(
      {
        username: string(),
        password: string(),
        database: string(required),
        dbpath: string(
          defaultTo(dataDbDir),
          fsExists()
        ),
        hosts: arrayOf(
          string(format(/([A-z]|[0-9]|-|\.)+:\d+/, 'Must be a url.')),
          required,
          length('>=', 1)
        )
      },
      ALLOW_ARBITRARY_KEYS,
      requiredIf('auth')
    ),

    services: object(
      cast(boolToObject),
      eachKeyMustBeObject
    ),

    auth: object(
      cast(boolToObject),
      autoFillAuth
    ),

    port: number(
      required
    ),

    logging: bool(
      defaultTo(true)
    )
  },
  ALLOW_ARBITRARY_KEYS,
  finishPathsAndLinkToEnv
)

const validateConfigUrl = Schema(
  string(
    required,
    notEmpty(),
    fsExists(),
    fsContainsConfigJson
  )
)

const validateConfig = (config, ...args) => {

  if (is.string(config))
    config = validateConfigUrl(config, ...args)

  if (!is.plainObject(config))
    throw new Error('must be a plain object or url')

  config = validateConfigObject(config, ...args)
  return config
}

const validateMode = new Schema(string(
  trim,
  notEmpty
), 'mode')

const validateClass = app => {

  if (is.defined(app.rest) && !is.func(app.rest))
    throw new Error('app.socketio not configured correctly. Must be a middleware function.')

  if (is.defined(app.socketio) && !is.func(app.socketio))
    throw new Error('app.socketio not configured correctly. Must be a middleware function.')

  if (is.defined(app.services) && !is.objectOf.func(app.services))
    throw new Error('app.services not configured correctly. Must be an object of functions.')

}

/******************************************************************************/
// Exports
/******************************************************************************/

export { validateConfig, validateMode, validateClass, isEnabled }
