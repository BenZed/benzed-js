const fs = require('fs')
const path = require('path')

/******************************************************************************/
// Main
/******************************************************************************/

function getPackages () {
  const packages = path.resolve(__dirname, '../../packages')
  const names = fs.readdirSync(packages)

  return {
    packages, names
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

module.exports = getPackages
