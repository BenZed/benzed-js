import is from 'is-explicit'

import validateOptions from './options/validate'
import inquireMissingOptions from './options/inquire-missing'
import parseArgs from './options/parse-args'

import writeTemplates from './write-templates'

/******************************************************************************/
// Helper
/******************************************************************************/

class Context {

  writtenFiles = []

  devDependencies = []

  dependencies = []

}

/******************************************************************************/
// Main
/******************************************************************************/

async function createProject (input) {

  let options

  if (is.arrayOf(String))
    options = parseArgs(input)

  else if (is.painObject(input))
    options = input
  else
    throw new Error('input must be an array of strings or a plain object')

  options = inquireMissingOptions(options)
  options = validateOptions(options)

  const context = new Context(options)

  await context::writeTemplates(options)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default createProject
