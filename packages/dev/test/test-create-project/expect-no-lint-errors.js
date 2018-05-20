import { execSync } from 'child_process'
import { expect } from 'chai'

/* global describe it */

/******************************************************************************/
// Main
/******************************************************************************/

function expectBabelBuild (projectDir, options) {

  describe('npm run lint', () => {

    it('should complete without error', function () {
      this.timeout(10000)
      this.slow(3000)

      expect(
        () => execSync('npm run lint', { cwd: projectDir })
      ).to.not.throw(Error)

    })
  })
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default expectBabelBuild
