import is from 'is-explicit'
import { execSync } from 'child_process'

import { tmpdir } from 'os'
import fs from 'fs-extra'
import path from 'path'

import flatten from './flatten'

/******************************************************************************/
// Data
/******************************************************************************/

const PACKAGES = path.resolve('../')

/******************************************************************************/
// Main
/******************************************************************************/

function generateDocsFromFile (url) {

  const stat = fs.statSync(url)
  if (stat.isDirectory())
    return flatten(fs.readdirSync(url)
      .map(name => path.join(url, name))
      .map(generateDocsFromFile)
      .filter(is.defined))

  // cant make docs out of non-js
  if (path.extname(url) !== '.js')
    return null

  // cant make docs of test files
  if (/\.test\.js$/.test(url))
    return null

  const rel = path.relative(PACKAGES, url)
  process.stdout.write(rel)
  const tmp = path.join(tmpdir(), path.basename(url) + 'on')

  let json = null
  try {
    execSync(`./node_modules/.bin/jsdoc -X ${url} > ${tmp}`)
    json = fs.readJsonSync(tmp)
    fs.removeSync(tmp)

  } catch (err) {
    process.stdout.write(` - error: ${err.message}`)
  }

  if (json)
    json = json
      .filter(obj => !obj.undocumented && obj.kind !== 'package')
      .map(({ meta, ...doc }) => Object({ ...doc, path: rel }))

  process.stdout.write(` - ${json && json.length > 0 ? '√' : 'x'} \n`)

  return json && json.length > 0
    ? json
    : null

}
/******************************************************************************/
// Exports
/******************************************************************************/

export default generateDocsFromFile

export { PACKAGES }
