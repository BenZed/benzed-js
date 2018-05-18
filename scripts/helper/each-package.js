const path = require('path')
const fs = require('fs')

const getPackages = require('./get-packages')

/******************************************************************************/
// Data
/******************************************************************************/

const { names, packages } = getPackages()

/******************************************************************************/
// Main
/******************************************************************************/

function eachPackage(func) {
  const results = []
  for (const name of names) {
    const package = path.join(packages, name)
    if (!fs.statSync(package).isDirectory())
      continue

    const result = func(name, package)
    results.push(result)
  }

  return results
}

/******************************************************************************/
// Exports
/******************************************************************************/

module.exports = eachPackage
