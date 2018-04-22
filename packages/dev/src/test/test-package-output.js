import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import targz from 'targz'

import { expect } from 'chai'

import getDescriber from './get-describer'

/* global it describe before after */

function deepReadDir (dir) {
  const names = fs.readdirSync(dir)

  const childNames = []
  for (const name of names) {
    const suburl = path.join(dir, name)
    const stat = fs.statSync(suburl)
    if (stat.isDirectory())
      childNames.push(...deepReadDir(suburl))

  }

  return [ ...names, ...childNames ]
}

/******************************************************************************/
// Main
/******************************************************************************/

function testPackageOutput (__dirname) {

  const packageJson = path.join(__dirname, 'package.json')
  const packageData = require(packageJson)

  const describer = getDescriber(this)

  describer(`${packageData.name} package output`, () => {

    let pkg

    before(async () => {
      const output = execSync('npm pack')

      const packedName = output.toString().trim()
      const packedUrl = path.join(__dirname, packedName)

      const unpackedUrl = packedName.replace(/\.tgz$/, '')
      const packageUrl = path.join(unpackedUrl, 'package')

      pkg = {
        output: packageUrl,
        dir: unpackedUrl,
        tgz: packedUrl
      }

      await new Promise((resolve, reject) =>
        targz.decompress({
          src: packedUrl,
          dest: unpackedUrl
        }, err => err
          ? reject(err)
          : resolve()))
    })

    after(() => {
      fs.removeSync(pkg.tgz)
      fs.removeSync(pkg.dir)
    })

    it('consists of only a package.json and lib folder', () => {
      const files = fs.readdirSync(pkg.output)
      expect(files).to.deep.equal(['lib', 'package.json'])
    })

    describe('lib folder', () => {
      let lib
      before(() => {
        lib = deepReadDir(path.join(pkg.output, 'lib'))
      })
      it('consists only of javascript files', () =>
        expect(lib.every(f => /\.js$/.test(f))).to.be.true
      )
      it('contains no tests', () =>
        expect(lib.every(f => /\.test\.js$/.test(f))).to.be.false
      )
    })
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getDescriber.wrap(testPackageOutput)
