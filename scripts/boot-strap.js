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
// Helpr
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


  // Link node_modules
  eachPackage((name, dir) => {

    const inPkgModules = path.join(dir, 'node_modules')
    const inBootModules = path.join(BOOTSTRAP, 'node_modules')

    link(inPkgModules, inBootModules)
    packageLog(name, 'node_modules linked')
  })

// TODO couldn't make this work, but ideally this would be better
// SO that packages cant use dependencies that arn't somewhere in their package.json

// Link Dependencies
// forEachPackageDependency(({ pkg, pkgDir, dep, depVersion }) => {
//
//   const inPkgModules = path.join(pkgDir, 'node_modules', dep)
//   fs.ensureDirSync(path.dirname(inPkgModules))
//
//   const inBootModules = path.join(BOOTSTRAP, 'node_modules', dep)
//
//   link(inPkgModules, inBootModules)
//
//   packageLog(pkg, dep + ' symlinked')
// })

// // Link .bin
// eachPackage((name, dir) => {
//
//   const inPkgModules = path.join(dir, 'node_modules', '.bin')
//   const inBootModules = path.join(BOOTSTRAP, 'node_modules', '.bin')
//
//   link(inPkgModules, inBootModules)
//   packageLog(name, '.bin linked')
// })
