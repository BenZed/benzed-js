import watchr from 'watchr'
import path from 'path'
import fs from 'fs-extra'

import generateDocsFromFile, { PACKAGES } from './common/generate-doc-from-file'
import byName from './common/sort-by-name'

/******************************************************************************/
// Data
/******************************************************************************/

const THIS_PACKAGE = path.basename(process.cwd())

const PACKAGE_NAMES = fs
  .readdirSync(PACKAGES)
  .filter(name => name !== THIS_PACKAGE)

const DOC_JSON = path.resolve('./src/docs.json')

/******************************************************************************/
// Listener
/******************************************************************************/

function listener (changeType, fullPath) {

  const name = this

  const packages = fs.readJsonSync(DOC_JSON)

  // only non-test js files
  if (!/\.js$/.test(fullPath) || /\.test\.js$/.test(fullPath))
    return

  const [ pkg ] = packages.filter(pkg => pkg.name === name)
  if (!pkg)
    return console.log(`package for ${name} could not be found`)

  const rel = path.relative(PACKAGES, fullPath)

  pkg.doc = (pkg.doc || []).filter(doc => doc.path !== rel)

  if (changeType !== 'deleted')
    pkg.doc.push(...(generateDocsFromFile(fullPath) || []))

  pkg.doc.sort(byName)

  fs.writeJsonSync(DOC_JSON, packages, { spaces: 2 })
}

/******************************************************************************/
// Execute
/******************************************************************************/

require('./generate-docs')

PACKAGE_NAMES.map(name =>
  watchr
    .open(
      path.join(PACKAGES, name, 'src'),
      name::listener,
      err => console.log(err
        ? `${name} watch fail: ${err}`
        : `${name} watching`)
    )
)
