require('colors')

const fs = require('fs-extra')
const path = require('path')
const { spawn, execSync } = require('child_process')

const { eachPackage, getPackages, packageLog } = require('./helper')

/******************************************************************************/
// DATA
/******************************************************************************/

const { names, packages } = getPackages()

/******************************************************************************/
// BUILD:DEV EACH PACKAGE
/******************************************************************************/

const subs = eachPackage((name, dir) => {

  packageLog(name, 'start build:dev'.bgCyan)

  const buildDev = spawn('npm', ['run', 'build:dev'], { cwd: dir })
  buildDev.stdout.on('data', data => {
    packageLog(name, data.toString().trim())
  })
  buildDev.on('close', () => {
    packageLog(name, 'stop build:dev'.white.bgRed)
  })

  return buildDev
})

/******************************************************************************/
// Handle Exit
/******************************************************************************/

process.on('exit', () => subs.forEach(sub => sub.kill()))
process.on('SIGINT', () => process.exit())
process.on('SIGTERM', () => process.exit())
