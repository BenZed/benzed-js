import fs from 'fs-extra'
import path from 'path'
import is from 'is-explicit'

import WebpackConfig from '../webpack-config'

/******************************************************************************/
// Data
/******************************************************************************/

const DOC_PREFIX = `
/******************************************************************************/
// Helpers
/******************************************************************************/

function toComponents (imported) {

  return Object
    .values(imported)
    .map(component => {
      return {
        type: 'component',
        name: component.name,
        component
      }
    })
}

/******************************************************************************/
// Exports
/******************************************************************************/

module.exports = `

/******************************************************************************/
// Helper
/******************************************************************************/

function generateRepos (input, webpackDir) {

  if (!is.plainObject(input))
    input = { 'benzed': input }

  if (!is.objectOf(input, String))
    throw new Error('must be an object of strings')

  const repos = []

  for (const repoName in input) {
    const dir = input[repoName]
    const repo = {
      name: repoName,
      type: 'repo',
      children: generateDocs(dir, 'package', webpackDir)
    }

    if (repo.children.length > 0)
      repos.push(repo)
  }

  return repos
}

function generateDocs (dir, type = 'module', webpackDir) {

  const docs = []

  const names = fs.readdirSync(dir)
  for (const name of names) {
    let file = path.join(dir, name)
    if (type === 'package')
      file = path.join(file, 'src')

    let stat
    try {
      stat = fs.statSync(file)
    } catch (e) {
      continue
    }

    if (stat.isDirectory()) {

      const doc = {
        name,
        type,
        children: []
      }

      doc.children.push(...generateDocs(file, 'module', webpackDir))

      if (doc.children.length > 0)
        docs.push(doc)

    } else if (/\.doc\.js$/.test(name))
      docs.push(toComponentString(file, webpackDir))

  }

  return docs
}

function toComponentString (file, webpackDir) {

  const relative = path.relative(webpackDir, file)
  const withoutExt = relative.replace(/\.js$/, '')

  return `<!--${withoutExt}-->`
}

function getWebpackDir (config) {
  const [ index ] = Object.values(config.entry)
  return path.dirname(index)
}

function convertToJsString (repos) {

  const json = JSON.stringify(repos, null, 2)

  const js = DOC_PREFIX +
    json
      // single quote
      .replace(/"/g, '\'')
      // swap component headers
      .replace(/'<!--/g, '...toComponents(require(\'')
      // swap component footers
      .replace(/-->'/g, '\'))') +
      // final line end
      '\n'

  return js

}

/******************************************************************************/
// Main
/******************************************************************************/

function DocWebpackConfig ({ docroot = path.resolve('../'), ...input }) {

  const config = new WebpackConfig(input)

  const webpackDir = getWebpackDir(config)

  const repos = generateRepos(docroot, webpackDir)

  const js = convertToJsString(repos)

  fs.writeFileSync(
    path.join(webpackDir, 'docs.js'),
    js
  )

  return config

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default DocWebpackConfig
