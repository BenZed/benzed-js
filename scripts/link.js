require('colors')

const fs = require('fs-extra')
const path = require('path')
const symlinked = require('symlinked')
const { spawn, execSync } = require('child_process')

const { eachPackage, getPackages, packageLog } = require('./helper')

/******************************************************************************/
// DATA
/******************************************************************************/

const { names } = getPackages()

// child output to parent
const stdio = [ 0, 1, 2 ]

/******************************************************************************/
// UNLINK ALL PACKAGES
/******************************************************************************/

let prefix

function isGloballySymlinked (name, dir) {
  if (!prefix)
    prefix = execSync('npm prefix -g').toString().trim()

  const globalModules = path.join(prefix, 'lib/node_modules')
  const globalLink = path.join(globalModules, `@benzed/${name}`)

  return fs.existsSync(globalLink) && fs.realpathSync(globalLink) === dir
}

/******************************************************************************/
// GLOBAL SYMLINK ALL PACKAGES
/******************************************************************************/

eachPackage((name, dir) => {

  const isLinked = isGloballySymlinked(name, dir)

  const msg = isLinked
    ? 'global symlink already created'.bgGreen
    : 'creating global symlink'

  packageLog(name, msg)
  if (!isLinked)
    execSync(`npm link`, { cwd: dir, stdio })
})

/******************************************************************************/
// SYMLINK ALL PACKAGES TO EACH OTHER
/******************************************************************************/

eachPackage((name, dir) => {
  const subDeps = path.join(dir, 'node_modules/@benzed')
  fs.removeSync(subDeps)
  fs.ensureDirSync(subDeps)
})

eachPackage((name, dir) => {

  const {
    dependencies = {},
    devDependencies = {}
  } = fs.readJsonSync(path.join(dir, 'package.json'))

  const packagesToLink = names
    .map(n => `@benzed/${n}`)
    .filter(p =>
      p in dependencies || p in devDependencies
    )

  const msg = packagesToLink.length > 0
    ? [ 'creating local symlinks'.bgYellow, ...packagesToLink ].join(' ')
    : 'no local symlinks to create'.bgGreen

  packageLog(name, msg)
  if (packagesToLink.length > 0) {
    const moduleDir = path.join(dir, 'node_modules', '@benzed')
    for (const packageName of packagesToLink) {
      const name = packageName.replace('@benzed/', '')
      const fromDir = path.resolve(moduleDir, name)
      const toDir = path.resolve(__dirname, `../packages/${name}`)
      fs.linkSync(fromDir, toDir, 'dir')
    }
  }

  process.exit()

})
