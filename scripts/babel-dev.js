require('colors')

const fs = require('fs-extra')
const path = require('path')

const { spawn } = require('child_process')

const { eachPackage, packageLog } = require('./helper')

// TODO
// this could very easily be changed to run any script

/******************************************************************************/
// run babel:dev in each package
/******************************************************************************/

const subs = eachPackage((name, dir) => {

  // ensure that the package actually has the babel:dev script
  let json = null
  try {
    json = fs.readJsonSync(path.join(dir, 'package.json'))
  } catch (e) { } //eslint-disable-line

  if (!json || !json.scripts || !json.scripts['babel:dev']) {
    packageLog(name, 'no babel:dev'.bgYellow)
    return null
  }

  packageLog(name, 'start babel:dev'.bgCyan)

  const buildDev = spawn('npm', ['run', 'babel:dev'], { cwd: dir })

  buildDev.stdout.on('data', data => {
    packageLog(name, data.toString().trim())
  })

  buildDev.on('close', () => {
    packageLog(name, 'stop babel:dev'.white.bgRed)
  })

  return buildDev

}).filter(child => child !== null)

/******************************************************************************/
// Handle Exit
/******************************************************************************/

process.on('exit', () => subs.forEach(sub => sub.kill()))
process.on('SIGINT', () => process.exit())
process.on('SIGTERM', () => process.exit())
