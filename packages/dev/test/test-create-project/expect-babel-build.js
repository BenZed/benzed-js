import { execSync } from 'child_process'
import { expect } from 'chai'

/* global describe it before */

/******************************************************************************/
// Main
/******************************************************************************/

function expectBabelBuild (projectDir, options) {

  describe('npm run babel', function () {

    this.timeout(10000)
    this.slow(3000)

    let output, err
    before(() => {
      try {
        output = execSync('npm run babel', {
          cwd: projectDir,
          stdio: ['ignore', 'pipe', 'ignore']
        }).toString()
      } catch (e) {
        err = e
      }
    })

    it('completes without error', () => {
      expect(err).to.not.be.instanceof(Error)
    })

    it('copies all files', () => {
      const build = options.api ? 'dist' : 'lib'
      expect(output).to.include(`rm -rf ${build}; mkdir ${build}; babel src --out-dir ${build} --copy-files`)
    })
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default expectBabelBuild
