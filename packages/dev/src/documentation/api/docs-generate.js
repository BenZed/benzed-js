import fs from 'fs-extra'
import path from 'path'

import { between } from '@benzed/string'
import { push, copy } from '@benzed/immutable'

/******************************************************************************/
// Data
/******************************************************************************/

const DEVELOPMENT = process.env.NODE_ENV === 'development'

/******************************************************************************/
// Development
/******************************************************************************/

// HACK this just rewrites the webpack index.js if it exists to force a webpack
// reload. This should be configurable.
const reloadWebpack = async () => {

  const index = path.join(process.cwd(), 'src', 'documentation', 'webpack', 'index.js')
  try {
    await fs.stat(index)
  } catch (err) {
    // Doesn't exist
    return
  }

  const data = await fs.readFile(index)

  await fs.writeFile(index, data)
}

const watchBuildDocs = (service, rootDir) => {

  const build = async () => {
    build.inprogress = true

    await service.remove(null)
    await buildDocs(service, rootDir)
    await reloadWebpack()

    build.inprogress = false
  }

  build()

  fs.watch(rootDir, { recursive: true }, async (event, file) => {

    // Ignore if building is already in progress
    if (build.inprogress)
      return

    // Markdown files only
    if (path.extname(file) !== '.md')
      return

    // Ignore files that are being built by babel
    if (file.includes('/lib/') || file.includes('/dist/'))
      return

    await build()
  })
}

/******************************************************************************/
// Helper
/******************************************************************************/

const trim = string => string && string.trim()

const isNotEmpty = string => string && string.length > 0

const tryGetJson = value => {
  try {
    return JSON.parse(value.replace(/'/g, '"'))
  } catch (err) {
    return undefined
  }
}

const parseMdDocComment = comment => {

  const params = comment.replace(/<!--|-->/g, '')
    .split(/\n/)
    .filter(isNotEmpty)
    .reduce((obj, param) => {

      const [ key, value ] = param
        .split(/@|=/)
        .map(trim)
        .filter(isNotEmpty)

      if (key)
        obj[key] = param.includes('=')
          ? tryGetJson(value)
          : true

      return obj
    }, {})

  return params
}

const parseMdDocs = md => {

  const docs = []
  let comment = null

  do {

    comment = between(md, '<!--', '-->')
    if (comment !== null) {
      const lastIndexOfComment = md.indexOf(comment) + comment.length
      const mdRemaining = md.substring(lastIndexOfComment)
      const mdSlice = mdRemaining.includes('<!--')
        ? mdRemaining.substring(0, mdRemaining.indexOf('<!--'))
        : mdRemaining

      docs.push({
        params: parseMdDocComment(comment),
        md: mdSlice
      })

      md = mdRemaining
    } else if (docs.length === 0)
      docs.push({
        params: {},
        md
      })

  } while (comment !== null)

  return docs
}

const isDir = async url => {
  const stat = await fs.stat(url)
  return stat.isDirectory()
}

const isPackage = async dir => {
  const names = await fs.readdir(dir)
  return names.includes('package.json') && names.includes('src')
}

const buildJsDoc = async (service, file) => {
  // TODO finish this
}

const buildMdDoc = async (service, file, ext, trail) => {

  const md = await fs.readFile(file, 'utf-8')
  const docs = parseMdDocs(md)

  for (const doc of docs) {
    const { name = path.basename(file, ext), ...params } = doc.params

    const data = {
      name,
      path: trail::copy(),
      ...params,
      data: doc.md,
      type: 'md'
    }

    if (data.path[data.path.length - 1] !== name)
      data.path.push(name)

    await service.create(data)

  }

}

const buildDocs = async (service, dir, trail = []) => {

  const names = await fs.readdir(dir)

  for (const name of names) {
    const url = path.join(dir, name)

    const urlIsDir = await isDir(url)
    const urlIsPkg = urlIsDir && await isPackage(url)
    if (urlIsDir) {
      await buildDocs(
        service,
        urlIsPkg
          ? path.join(url, 'src')
          : url,
        trail::push(name)
      )
      continue
    }

    // Why not use path.extname? Because, path.extname will return '.js' for
    // files ending in .test.js, which I don't want
    const ext = name.substr(name.indexOf('.'))
    if (ext === '.js')
      await buildJsDoc(service, url, trail)

    else if (ext === '.doc.md')
      await buildMdDoc(service, url, ext, trail)

    // else if (ext === '.doc.js')
    //   buildJsxDoc(service, url, ext)
  }

  if (trail.length === 0)
    console.log('docs built:', (await service.find({ paginate: false })).length)

}

async function hasNoDocs () {
  const service = this
  const docs = await service.find({ paginate: false })

  return docs.length === 0
}

/******************************************************************************/
// Main
/******************************************************************************/

const generateDocumentation = props => {

  const rootDir = props.root

  return async api => {

    const service = api.service('docs')

    if (DEVELOPMENT)
      watchBuildDocs(service, rootDir)

    if (await service::hasNoDocs())
      await buildDocs(service, rootDir)

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default generateDocumentation
