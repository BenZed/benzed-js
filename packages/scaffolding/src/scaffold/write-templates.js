import path from 'path'
import fs from 'fs-extra'
import Template from './template'

/******************************************************************************/
// Data
/******************************************************************************/

const TEMPLATES_DIR = path.join(__dirname, '../templates')

/******************************************************************************/
// Helper
/******************************************************************************/

function writeTemplate (templateUrl) {

  const scaffold = this

  const template = new Template(scaffold, templateUrl)

  const {
    default: getText, dependencies, devDependencies
  } = require(templateUrl)

  const text = getText(template)

  const url = template.writeToFile(text, templateUrl)
  if (url)
    scaffold.writtenFiles.push(url)

  scaffold.addDependencies(dependencies, templateUrl)
  scaffold.addDevDependencies(devDependencies, templateUrl)
  scaffold.addDependenciesFromImportStatements(text, templateUrl)

}

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Takes a directory of module templates and runs each one recursively.
 *
 * @this Scaffold
 * @param  {string} dir Path of directory to run.
 */
function writeTemplates (dir = TEMPLATES_DIR) {

  const scaffold = this
  const names = fs.readdirSync(dir)
  const urls = names.map(name => path.join(dir, name))

  for (const url of urls)

    if (fs.statSync(url).isDirectory())
      scaffold::writeTemplates(url)

    else
      scaffold::writeTemplate(url)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default writeTemplates
