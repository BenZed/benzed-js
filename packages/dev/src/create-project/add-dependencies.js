import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import { execSync } from 'child_process'

/******************************************************************************/
//
/******************************************************************************/

const PACKAGES_JSON_DIR = path.join(os.tmpdir(), '@benzed-dev-create-project-packages.json')

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7 // milliseconds

/******************************************************************************/
// Helper
/******************************************************************************/

function makePackagesJson (deps) {
  const json = {
    timestamp: Date.now(),
    list: deps.map(name => {
      const version = execSync(`npm info ${name} version`)
        .toString()
        .trim()

      return { name, version }
    })
  }

  fs.writeJsonSync(PACKAGES_JSON_DIR, json)

  return json

}

function ensurePackagesJson (deps) {

  if (!fs.existsSync(PACKAGES_JSON_DIR))
    return makePackagesJson(deps)

  let packagesJson
  try {
    packagesJson = fs.readJsonSync(PACKAGES_JSON_DIR)
  } catch (err) {
    return makePackagesJson(deps)
  }

  if (Date.now() - packagesJson.timestamp > ONE_WEEK)
    return makePackagesJson(deps)

  for (const dep of deps)
    if (!packagesJson.list.some(item => item.name === dep))
      return makePackagesJson(deps)

  return packagesJson
}

function getVersion (dep, packages) {
  return packages.list.filter(obj => obj.name === dep)[0].version
}

/******************************************************************************/
// Main
/******************************************************************************/

function addDependencies () {

  const context = this

  const { dependencies, devDependencies } = context

  const packages = ensurePackagesJson([ ...dependencies, ...devDependencies ])
  const [ packageJsonUrl ] = context.writtenFiles.filter(url => path.basename(url) === 'package.json')

  const pkg = fs.readJsonSync(packageJsonUrl)

  pkg.dependencies = {}
  for (const dep of dependencies)
    pkg.dependencies[dep] = `^${getVersion(dep, packages)}`

  pkg.devDependencies = {}
  for (const dep of devDependencies)
    pkg.devDependencies[dep] = `^${getVersion(dep, packages)}`

  fs.writeJsonSync(packageJsonUrl, pkg, { spaces: 2 })

  return pkg

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default addDependencies
