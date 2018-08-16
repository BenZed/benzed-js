import fs from 'fs-extra'
import path from 'path'

import WebpackConfig from '../webpack-config'

/******************************************************************************/
// Data
/******************************************************************************/

const IGNORE_DIRS = [ 'lib', 'dist', 'node_modules' ]

/******************************************************************************/
// Helper
/******************************************************************************/

function generatePackages (dir = path.resolve('../')) {

  const packages = {}

  const names = fs.readdirSync(dir)
  for (const name of names) {

    const url = path.join(dir, name)
    const stat = fs.statSync(url)
    if (stat.isDirectory()) {
      const list = generateDocJsList(url)
      if (list.length > 0)
        packages[name] = list
    }

  }

  return packages
}

function generateDocJsList (dir = path.resolve('../')) {

  const names = fs.readdirSync(dir)
  const list = []

  for (const name of names) {
    const file = path.join(dir, name)
    const stat = fs.statSync(file)

    if (stat.isDirectory() && !IGNORE_DIRS.includes(name))
      list.push(...generateDocJsList(file, list))

    else if (/\.doc\.js$/.test(file) && file !== __filename.replace('lib', 'src'))
      list.push(file)
  }

  return list

}

function putJsBesideEntry (packages, entry) {

  const [ index ] = Object.values(entry)

  const dir = path.dirname(index)

  const js = Object.entries(packages).map(entry => {
    const [ name, list ] = entry
    return `const ${name} = [` +
      list.map(url => path
        .relative(dir, url)
        .replace('.js', ''))
        .map(url => `\n  require('${url}')`)
        .join(',') +
    `\n]`
  }).join('\n\n') +
  `\n\nexport {\n  ${Object.keys(packages).join(',\n  ')}\n}\n`

  fs.writeFileSync(
    path.join(dir, 'docs.js'),
    js
  )

}

/******************************************************************************/
// Main
/******************************************************************************/

function DocWebpackConfig ({ docroot, ...input }) {

  const config = new WebpackConfig(input)

  const packages = generatePackages(docroot)

  // add all the aliases and doc.js finding stuff here
  putJsBesideEntry(packages, config.entry)

  return config

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default DocWebpackConfig
