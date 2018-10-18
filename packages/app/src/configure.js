import fs from 'fs-extra'
import path from 'path'
import is from 'is-explicit'
import { randomBytes } from 'crypto'

// eslint-disable-next-line no-unused-vars
import { createValidator } from '@benzed/schema'
import { get, set } from '@benzed/immutable'

import { boolToObject, isEnabled } from './util'

// @jsx createValidator
/* eslint-disable react/react-in-jsx-scope */

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
// defaults
/******************************************************************************/

const dataDbDir = () => {

  const cwd = process.cwd()
  const fsRoot = path.parse(cwd).root

  return path.join(fsRoot, 'data', 'db')
}

/******************************************************************************/
// schemas
/******************************************************************************/

const ConfigUrl = <string
  length={['>', 0, 'must not be empty']}
  validate={[ fsExists(), fsContainsConfigJson() ]}
/>

const Config = <object
  cast={ConfigUrl}
  plain
  strict
  validate={finishPathsAndLinkToEnv}>

  <object key='rest'
    cast={boolToObject}
    validate={requiredIfNo('socketio')}
  >
    <string key='public'
      validate={[fsExists(), fsContains('index.html')]}
    />
  </object>

  <object key='socketio'
    cast={boolToObject}
    validate={requiredIfNo('rest')}
  />

  <object key='mongodb' validate={requiredIf('auth')}>

    <string key='username' />
    <string key='password' />
    <string key='database' />
    <string key='dbpath'
      default={dataDbDir}
      validate={fsExists()}
    />

    <array key='hosts' length={[ '>=', 1 ]}>
      <string
        format={[/([A-z]|[0-9]|-|\.)+:\d+/, 'Must be a url.']}
        required
      />
    </array>

  </object>

  <object key='services'
    cast={boolToObject}
    validate={eachKeyMustBeObject}
  />

  <object key='auth' plain cast={boolToObject} >
    <string key='secret' default={() => randomBytes(48).toString('hex')} />
    <string key='path' default='/authentication' />
    <string key='entity' default='user' />
    <string key='service' default='users' />
  </object>

  <number key='port' required />

  <bool key='logging' default={!!true} />

</object>

const Mode = <string key='mode'
  trim
  length={['>', 0, 'must not be empty']}
/>

/******************************************************************************/
// Exports
/******************************************************************************/

export { Config, Mode, isEnabled }
