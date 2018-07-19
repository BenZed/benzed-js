require('colors')

const fs = require('fs-extra')
const path = require('path')
const { spawn, execSync } = require('child_process')

const { eachPackage, getPackages, packageLog } = require('./helper')

/******************************************************************************/
// DATA
/******************************************************************************/

const BOOTSTRAP = path.resolve(__dirname, '../bootstrap')
const PACKAGES = path.resolve(__dirname, '../packages')

const stdio = [ 0, 1, 2 ]

/******************************************************************************/
// Helper
/******************************************************************************/

function install (dep, versions) {

  const jsonUrl = path.join(BOOTSTRAP, 'package.json')
  const json = fs.readJsonSync(jsonUrl)

  if (dep.includes('@benzed/')) {

    const name = dep.replace('@benzed/', '')

    const benzedInHoisted = path.join(BOOTSTRAP, 'node_modules', '@benzed')
    fs.ensureDirSync(benzedInHoisted)

    const from = path.join(benzedInHoisted, name)
    const to = path.join(PACKAGES, name)

    const result = link(from, to)
    if (result)
      console.log(`${dep} symlinked to ${to}`)
    else
      console.log(`${dep} already symlinked to ${to}`)

    json.dependencies[dep] = 'latest'
    fs.writeJsonSync(jsonUrl, json, { spaces: 2 })
  }

  const version = json.dependencies[dep]

  if (version && versions.includes(version))
    return console.log(`${dep} already installed`)

  if (version && !versions.includes(version))
    execSync(`npm uninstall ${dep} --no-package-lock --prefix ${BOOTSTRAP}`, { stdio })

  execSync(`npm install ${dep}  --no-package-lock --prefix ${BOOTSTRAP}`, { stdio })
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

// function isGloballySymlinked (name, dir) {
//   if (!prefix)
//     prefix = execSync('npm prefix -g').toString().trim()
//
//   const globalModules = path.join(prefix, 'lib/node_modules')
//   const globalLink = path.join(globalModules, `@benzed/${name}`)
//
//   return fs.existsSync(globalLink) && fs.realpathSync(globalLink) === dir
// }


function forEachPackageDependency (func) {

  eachPackage((name, dir) => {
    const pkg = fs.readJsonSync(path.join(dir, 'package.json'))
    for (const type of [ 'dependencies', 'devDependencies', 'peerDependencies']) {
      const deps = pkg[type]
      if (!deps)
        continue

      for (const dep in deps)
        func({ pkg: name, pkgDir: dir, dep, depVersion: deps[dep] })

    }
  })
}
/******************************************************************************/
// Execute
/******************************************************************************/

fs.ensureDirSync(BOOTSTRAP)

// Create Dependency List
const DEPS = {}
forEachPackageDependency(({ dep, depVersion }) => {
  DEPS[dep] = DEPS[dep] || []

  if (!DEPS[dep].includes(depVersion))
    DEPS[dep].push(depVersion)
})

// Install Dependencies
const names = Object.keys(DEPS)
// @benzed deps last
names.sort((a,b) => {
  const aIsBZ = a.includes('@benzed')
  const bIsBZ = b.includes('@benzed')
  if (aIsBZ)
    return 1
  else if (bIsBZ)
    return -1
  else return 0
})

for (const name of names)
  install(name, DEPS[name])

// Link each package node_modules to bootstrap/node_modules
eachPackage((name, dir) => {

  const inPkgModules = path.join(dir, 'node_modules')
  const inBootModules = path.join(BOOTSTRAP, 'node_modules')

  link(inPkgModules, inBootModules)
  packageLog(name, 'node_modules linked')
})

// // Global Symlink @benzed/dev so that the command line tool can be used
// eachPackage((name, dir) => {
//
//   if (name !== 'dev')
//     return
//
//   const isLinked = isGloballySymlinked(name, dir)
//
//   const msg = isLinked
//     ? 'global symlink already created'.bgGreen
//     : 'creating global symlink'
//
//   packageLog(name, msg)
//   if (!isLinked)
//     execSync(`npm link`, { cwd: dir, stdio })
// })
