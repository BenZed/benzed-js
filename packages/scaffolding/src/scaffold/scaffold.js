import args from 'args'

import validateOptions from './validate-options'
import writeTemplates from './write-templates'
import installDependencies from './install-dependencies'

import is from 'is-explicit'
import path from 'path'
import fs from 'fs-extra'

import { toLines } from './template'

/******************************************************************************/
// Data
/******************************************************************************/

const CORE_PACKAGES = require('repl')._builtinLibs

/******************************************************************************/
// Helper
/******************************************************************************/

function printError (err) {
  if (is.plainObject(err))
    for (const i in err)
      printError(err[i])

  else
    console.error(err)
}

function cleanTargetDir (dir = path.join(this.flags.dir, this.options.name)) {

  const scaffold = this

  const names = fs
    .readdirSync(dir)

  const urls = names
    .map(name => path.join(dir, name))

  // eslint-disable-next-line curly
  if (urls.length > 0) for (const url of urls) {

    if (fs.statSync(url).isDirectory())
      scaffold::cleanTargetDir(url)

    else if (!scaffold.writtenFiles.includes(url))
      fs.unlinkSync(url)

  } else fs.rmdirSync(dir)

}

/******************************************************************************/
// Main
/******************************************************************************/

class Scaffold {

  writtenFiles = []

  packages = []

  get targetDir () {

    const { flags, options } = this

    return path.join(flags.dir, options.name)
  }

  constructor (argv = process.argv, options) {

    this.flags = args
      .option('dir', 'directory where project will be generated', process.cwd())
      .option('install', 'should dependencies be installed', true)
      .parse(argv)

    // args creates the same flag 3 times with single letter alternatives,
    // which I don't need
    for (const key in this.flags)
      if (key.length === 1)
        delete this.flags[key]

    return this::validateOptions(options)
      .then(this::writeTemplates)
      .then(this::cleanTargetDir)
      .then(this::installDependencies)
      .catch(printError)

  }

  addDependencies (deps, templateUrl, saveAsDev) {

    if (is(deps, Function))
      deps = deps({ has: this.options })

    const { packages } = this

    if (deps) for (const name of deps) {

      if (!is(name, String) || name.length === 0)
        continue

      const index = packages.reduce((index, pkg, i) =>
        pkg.name === name && index === -1 ? i : index
        , -1)

      let pkg
      if (index === -1) {
        pkg = { name, refs: [], dev: !!saveAsDev }
        packages.push(pkg)
      } else
        pkg = packages[index]

      if (!pkg.refs.includes(templateUrl))
        pkg.refs.push(templateUrl)

    }

  }

  addDevDependencies (deps, templateUrl) {
    this.addDependencies(deps, templateUrl, true)
  }

  addDependenciesFromImportStatements (text, templateUrl) {

    const deps = []

    const lines = text::toLines()

    if (lines) for (const line of lines) {

      // If this string contains an import statement we'll grab the package name
      const match = line.match(/import.+'(.+)'/)
      if (!match)
        continue

      // the name will be the 2nd entry (1st index) of the match
      let name = match[1]

      // skip relative dependencies
      if (/^\.\.?\//.test(name))
        continue

      // From the name, we'll try to get the actual package
      const split = name.split('/')

      // if it's @feathersjs/express/whatever, the actual package is
      // @feathersjs/express
      if (/^@/.test(name))
        name = split[0] + '/' + split[1]

      // otherwise if it's is-explicit/this, the actual package is
      // is-explicit
      //
      // so that's loads of fun
      else
        name = split[0]

      if (!CORE_PACKAGES.includes(name))
        deps.push(name)
    }

    this.addDependencies(deps, templateUrl)
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Scaffold
