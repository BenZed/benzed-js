import is from 'is-explicit'
import path from 'path'
import fs from 'fs-extra'

import validateOptions from './options/validate'
import inquireMissingOptions from './options/inquire-missing'
import parseArgs from './options/parse-args'

import writeTemplates from './write-templates'

/******************************************************************************/
// Helper
/******************************************************************************/

class Context {

  constructor (options) {
    this.options = options
    this.projectDir = path.join(options.dir, options.name)

    const { api, auth } = options

    const backend = auth ? 'api' : 'server'

    let frontend = auth ? 'app' : 'website'
    if (!api)
      frontend = 'example'

    this.backend = backend
    this.frontend = frontend
  }

  writtenFiles = []
  devDependencies = []
  dependencies = []

}

/******************************************************************************/
//
/******************************************************************************/

function createProjectFolder () {

  const context = this

  const { dir } = context.options
  const { projectDir } = context

  if (!fs.existsSync(dir))
    throw new Error(`${dir} does not exist.`)

  fs.ensureDirSync(projectDir)
}

async function createProject (input) {

  let options

  if (is.arrayOf(input, String))
    options = parseArgs(input)

  else if (is.plainObject(input))
    options = input
  else
    throw new Error('input must be an array of strings or a plain object')

  options = inquireMissingOptions(options)
  options = validateOptions(options)

  const context = new Context(options)

  context::createProjectFolder()
  await context::writeTemplates()

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default createProject
