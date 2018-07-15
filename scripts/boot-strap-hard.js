require('colors')

const fs = require('fs-extra')
const path = require('path')
const { spawn, execSync } = require('child_process')

const { eachPackage, getPackages, packageLog } = require('./helper')

/******************************************************************************/
// DATA
/******************************************************************************/

const BOOTSTRAP = path.resolve(__dirname, '../bootstrap')

/******************************************************************************/
// Execute
/******************************************************************************/

// remove all package node modules
eachPackage((name, dir) => {
  const node_modules = path.join(dir, 'node_modules')
  fs.removeSync(node_modules)
})

// remove bootstrap node modules
fs.removeSync(path.join(BOOTSTRAP, 'node_modules'))

// clear bootstrap json
const jsonUrl = path.join(BOOTSTRAP, 'package.json')
const json = fs.readJsonSync(jsonUrl)
json.dependencies = {}
fs.writeJsonSync(jsonUrl, json, { spaces: 2 })

// run bootstrap
require('./boot-strap')
