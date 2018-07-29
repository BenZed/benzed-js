require('colors')

const fs = require('fs-extra')
const path = require('path')
const { execSync } = require('child_process')
const semver = require('semver')

const { eachPackage, packageLog } = require('./helper')

/******************************************************************************/
// DATA
/******************************************************************************/

const BOOTSTRAP = path.resolve(__dirname, '../bootstrap')
const MODULES = path.resolve(__dirname, '../node_modules')
const PACKAGES = path.resolve(__dirname, '../packages')

const stdio = [ 0, 1, 2 ]

/******************************************************************************/
// Helper
/******************************************************************************/

function install (dep, version) {

  const jsonUrl = path.join(BOOTSTRAP, 'package.json')
  const json = fs.readJsonSync(jsonUrl)

  if (dep.includes('@benzed/')) {

    const name = dep.replace('@benzed/', '')

    const benzedInModules = path.join(MODULES, '@benzed')
    fs.ensureDirSync(benzedInModules)

    const from = path.join(benzedInModules, name)
    const to = path.join(PACKAGES, name)

    const result = link(from, to)
    if (result)
      console.log(`${dep} symlinked @ ${from}`)
    else
      console.log(`${dep} already symlinked @ ${from}`)

    json.dependencies[dep] = 'latest'
    return fs.writeJsonSync(jsonUrl, json, { spaces: 2 })
  }

  const iVersion = json.dependencies[dep]

  if (iVersion && semver.intersects(iVersion, version))
    return console.log(`${dep} already installed`)

  if (iVersion && !semver.intersects(iVersion, version)) {
    console.log(`${dep} installed, but incorrect version: ${iVersion} should be ${version}`)
    execSync(`npm uninstall ${dep} --no-package-lock --prefix ${BOOTSTRAP}`, { stdio })
  }

  execSync(`npm install ${dep}@"${semver.validRange(version)}" --no-package-lock --prefix ${BOOTSTRAP}`, { stdio })
}

function link (from, to) {
  try {
    let link = fs.readlinkSync(from)
    if (link === to)
      return false

    fs.unlinkSync(from)
  } catch (e) {
    if (e.message.includes('EINVAL'))
      fs.removeSync(from)
  }

  fs.symlinkSync(to, from, 'dir')
  return true
}

let prefix

function isGloballySymlinked (name, dir) {
  if (!prefix)
    prefix = execSync('npm prefix -g').toString().trim()

  const globalModules = path.join(prefix, 'lib/node_modules')
  const globalLink = path.join(globalModules, `@benzed/${name}`)

  return fs.existsSync(globalLink) && fs.realpathSync(globalLink) === dir
}

function forEachPackageDependency (func) {

  eachPackage((name, dir) => {
    const pkg = fs.readJsonSync(path.join(dir, 'package.json'))
    for (const type of [ 'dependencies', 'devDependencies', 'peerDependencies']) {
      const deps = pkg[type]
      if (!deps)
        continue

      for (const dep in deps)
        func({ pkg: name, pkgDir: dir, dep, version: deps[dep], type })

    }
  })
}

function ensureBootStrap () {

  fs.ensureDirSync(BOOTSTRAP)
  const bootstrapsJson = path.join(BOOTSTRAP, 'package.json')

  if (fs.existsSync(bootstrapsJson))
    return

  const json = {
    description: 'This folder is for holding bootstrapped dependencies.',
    repository: 'non-existant',
    license: 'ISC',
  }

  fs.writeJsonSync(bootstrapsJson, json, { spaces: 2 })

}
/******************************************************************************/
// Execute
/******************************************************************************/

// Ensure Bootstrap
ensureBootStrap()

// Create Dependency List
const DEPS = {}
forEachPackageDependency(({ pkg, dep, version, type }) => {

  const eVersion = DEPS[dep]
  if (eVersion && !semver.intersects(version, eVersion))
    throw new Error(`${pkg} ${dep} versions mismatch in ${type}: ${version} incompatible with ${eVersion}`)

  if (!eVersion || semver.gt(semver.coerce(version).raw, semver.coerce(eVersion).raw))
    DEPS[dep] = version
})

// Install Dependencies
const names = Object.keys(DEPS)
for (const name of names)
  install(name, DEPS[name])

// Link each package node_modules to bootstrap/node_modules
eachPackage((name, dir) => {

  const inPkgModules = path.join(dir, 'node_modules')
  const inBootModules = path.join(BOOTSTRAP, 'node_modules')

  link(inPkgModules, inBootModules)
  packageLog(name, 'node_modules linked')
})

// @benzed deps might have been installed by other packages as depdndences
const benzedInBootstrap = path.join(BOOTSTRAP, '@benzed')
if (fs.existsSync(benzedInBootstrap))
  fs.removeSync(benzedInBootstrap)

// Global Symlink @benzed/dev so that the command line tool can be used
eachPackage((name, dir) => {

  const isLinked = isGloballySymlinked(name, dir)

  const msg = isLinked
    ? 'global symlink already created'.bgGreen
    : 'creating global symlink'

  packageLog(name, msg)
  if (!isLinked)
    execSync('npm link', { cwd: dir, stdio })
})
