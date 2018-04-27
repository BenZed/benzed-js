import path from 'path'
import fs from 'fs-extra'

/******************************************************************************/
// Data
/******************************************************************************/

const TEMPLATES_DIR = path.join(__dirname, './templates')

/******************************************************************************/
// Helper
/******************************************************************************/

function writeTemplate (options, url) {

  const context = this

  const {
    default: getText, dependencies, devDependencies
  } = require(url)

  const text = getText()

  // const url = template.writeToFile(text, url)
  // if (url)
  //   scaffold.writtenFiles.push(url)
  //
  // scaffold.addDependencies(dependencies, templateUrl)
  // scaffold.addDevDependencies(devDependencies, templateUrl)
  // scaffold.addDependenciesFromImportStatements(text, templateUrl)

}


/******************************************************************************/
// Main
/******************************************************************************/

function writeTemplates (options, dir = TEMPLATES_DIR) {

  const context = this

  const urls = fs
    .readdirSync(dir)
    .map(name => path.join(dir, name))

  for (const url of urls)

    if (fs.statSync(url).isDirectory())
      context::writeTemplates(url)

    else
      context::writeTemplate(url)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default writeTemplates
