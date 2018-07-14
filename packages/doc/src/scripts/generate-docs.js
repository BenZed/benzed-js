import fs from 'fs-extra'
import path from 'path'

import flatten from './common/flatten'
import byName from './common/sort-by-name'
import generateDocsFromFile, { PACKAGES } from './common/generate-doc-from-file'

/******************************************************************************/
// Data
/******************************************************************************/

const DOC_JSON = path.resolve('./src/docs.json')

const THIS_PACKAGE = path.basename(process.cwd())

/******************************************************************************/
// Helper
/******************************************************************************/

function generatePackageDocs (url) {

  const src = path.join(url, 'src')
  const packageJson = path.join(url, 'package.json')

  const { version, name, description } = fs.readJsonSync(packageJson)
  const doc = flatten(generateDocsFromFile(src)).sort(byName)

  return {
    version,
    name: name.replace('@benzed/', ''),
    description,
    doc
  }
}

/******************************************************************************/
// Main
/******************************************************************************/

function generateDocs (config) {
  console.log('writing docs\n')

  const pkgdocs = fs.readdirSync(PACKAGES)
    .filter(name => name !== THIS_PACKAGE)
    .map(name => path.join(PACKAGES, name))
    .map(generatePackageDocs)

  fs.writeJsonSync(DOC_JSON, pkgdocs, { spaces: 2 })

}

/******************************************************************************/
// Exports
/******************************************************************************/

generateDocs()
