import createProject from 'src/create-project'
import getDescriber from '../../src/test-util/get-describer'
import path from 'path'
import fs from 'fs-extra'

import { expect } from 'chai'

import expectFile from './expect-file'
import expectDependencies from './expect-dependencies'

/* global it describe before */

function checkAllRootFiles (projectDir, { api, ui }) {

  const ROOT_FILES = [ '.babelrc', '.eslintignore', '.eslintrc.json', '.gitignore', 'package.json' ]
  const ROOT_NON_API_FILES = [ '.npmignore' ]
  const ROOT_UI_FILES = [ 'webpack.config.js' ]

  describe('root files', () => {
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

function checkRootDependencies (projectDir, { ui, api }) {

  describe('root dependencies', () => {

    const packages = [
      { dev: false, name: '@benzed/react', not: !ui },
      { dev: false, name: '@benzed/app', not: !api },
      { dev: true, name: '@benzed/dev', not: false }
    ]

    expectDependencies({
      projectDir,
      packages
    })

  })

}

function checkConfig (projectDir, { ui, api, auth, files, rest, name, socketio }) {

  describe('config', () => {

    expectFile({
      projectDir,
      url: 'config/default.json',
      not: !api
    })

    describe('config data', () => {
      let json

      before(() => {
        json = fs.readJsonSync(path.join(projectDir, 'config/default.json'))
      })

      it(`user service is ${auth ? 'enabled' : 'not defined'}`, () => {
        expect(json.services.users).to.be.equal(auth || undefined)
      })

      it(`file service is ${files ? 'enabled' : 'not defined'}`, () => {
        expect(json.services.files).to.be.equal(files || undefined)
      })

      it(`rest is ${rest ? 'enabled' : 'disabled'}`, () => {
        expect(!!json.rest).to.equal(!!rest)
      })

      it(`rest is ${ui ? 'defined' : 'not defined'} as object`, () => {
        expect(json.rest instanceof Object).to.be.equal(ui)
        if (ui) {
          expect(json.rest.public).to.be.equal('../dist/public')
          expect(json.rest.favicon).to.be.equal('../dist/public/favicon.ico')
        }
      })

      it(`socketio is ${socketio ? 'enabled' : 'disabled'}`, () => {
        expect(!!json.socketio).to.equal(!!socketio)
      })

      it(`mongodb is ${auth || files ? 'defined' : 'not defined'}`, () => {
        expect('mongodb' in json).to.be.equal(!!(auth || files))
      })

      it(`auth is ${auth ? 'enabled' : 'disabled'}`, () => {
        expect(json.auth).to.be.equal(auth)
      })

      it('port defaults to 5100', () => {
        expect(json.port).to.be.equal(5100)
      })

      it('logging defaults to true', () => {
        expect(json.logging).to.be.equal(true)
      })
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

    checkAllRootFiles(projectDir, options)
    checkRootDependencies(projectDir, options)
    checkConfig(projectDir, options)

    // TODO
    // checkSrc
    // expectZeroLintErrors
    // allScriptsShouldRunWithoutError

  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getDescriber.wrap(testCreateProject)
