import { execSync } from 'child_process'
import { expect } from 'chai'

/* global describe it before */

/******************************************************************************/
// Main
/******************************************************************************/

function expectWebpackBuild (projectDir, options) {

  describe('npm run webpack', function () {

    this.timeout(10000)
    this.slow(3000)

    let output, err
    before(() => {
      try {
        output = execSync('npm run webpack', {
          cwd: projectDir,
          stdio: ['ignore', 'pipe', 'ignore']
        }).toString()
      } catch (e) {
        err = e
        console.log(err.stdout.toString())
      }
    })

    it('completes without error', () => {
      expect(err).to.not.be.instanceof(Error)
    })

    it('shows webpack output', () => {
      expect(output).to.include('Time: ')
    })

  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default expectWebpackBuild
