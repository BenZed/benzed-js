import createProject from 'src/create-project'
import getDescriber from '../../src/test-util/get-describer'
import path from 'path'
import fs from 'fs'

import { expect } from 'chai'

import expectFile from './expect-file'

/* global it describe */

function hasAllRootFiles (projectDir, { api, ui }) {

  const ROOT_FILES = [ '.babelrc', '.eslintignore', '.eslintrc.json', '.gitignore', 'package.json' ]
  const ROOT_NON_API_FILES = [ '.npmignore' ]
  const ROOT_UI_FILES = [ 'webpack.config.js' ]

  describe('has root files', () => {
    for (const file of ROOT_FILES)
      expectFile({
        projectDir,
        url: file
      })

    for (const file of ROOT_NON_API_FILES)
      expectFile({
        projectDir,
        url: file,
        not: api
      })

    for (const file of ROOT_UI_FILES)
      expectFile({
        projectDir,
        url: file,
        not: !ui
      })
  })

}
/******************************************************************************/
// Main
/******************************************************************************/

function testCreateProject (options) {

  const { dir, name } = options

  const projectDir = path.join(dir, name)
  const describer = getDescriber(this)

  describer(`project '${name}' created at ${projectDir}`, () => {

    it('completes successfully', () => {
      expect(() => createProject(options)).to.not.throw(Error)
    })

    it('project is created as a folder in given project directory', () => {
      let stat
      expect(() => {
        stat = fs.statSync(projectDir)
      }).to.not.throw(Error)
      expect(stat.isDirectory()).to.be.equal(true)

    })

    hasAllRootFiles(projectDir, options)

    // TODO expect project to have a .babelrc, package.json, ect.
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getDescriber.wrap(testCreateProject)
