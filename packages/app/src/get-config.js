import path from 'path'
import is from 'is-explicit'
import fs from 'fs-extra'

/******************************************************************************/
// Helper
/******************************************************************************/

function isUpperSnakeCase () {
  const string = this

  return is.string(string) && [ ...string ].every(char => /[A-Z]|_/.test(char))
}

function isRelativePath () {
  const string = this

  return is.string(string) && /^\.\.?/.test(string) && string.includes(path.sep)
}

// All UPPER_CASE strings will be linked to process.env variables, all
// relative paths will be resolved from process.cwd()
const linkConfigToEnvAndCwd = input => {

  if (!is.plainObject(input))
    return input

  const output = { }

  for (const key in input) {
    let value = input[key]

    if (value::isUpperSnakeCase())
      value = process.env[value]

    else if (value::isRelativePath())
      value = path.join(process.cwd(), value)

    else if (is.plainObject(value))
      value = linkConfigToEnvAndCwd(value)

    else if (is.array(value))
      value = value.map(linkConfigToEnvAndCwd)

    output[key] = value
  }

  return output

}

const tryReadJson = url => {

  let json
  try {
    json = fs.readJsonSync(url)
  } catch (err) {

    // we want to throw syntax errors and the like
    if (!err.message.includes('ENOENT'))
      throw err

    json = {}
  }

  if (!is.plainObject(json))
    throw new Error(`${path.basename(url)} must be a plain object.`)

  return json
}

const getConfig = (config = path.join(process.cwd(), 'config')) => {

  if (!is.string(config))
    throw new Error('provided config url must be a string')

  const { NODE_ENV } = process.env

  const defJson = path.join(config, 'default.json')
  const envJson = NODE_ENV
    ? path.join(config, `${NODE_ENV}.json`)
    : { }

  const merged = {
    ...tryReadJson(defJson),
    ...tryReadJson(envJson)
  }

  const linked = linkConfigToEnvAndCwd(merged)

  return linked
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getConfig
