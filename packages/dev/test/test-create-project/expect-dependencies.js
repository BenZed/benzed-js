import getDescriber from '../../src/test-util/get-describer'
import fs from 'fs-extra'
import path from 'path'
import { expect } from 'chai'

/******************************************************************************/
// Main
/******************************************************************************/

function expectDependencies ({
  projectDir,
  packages
}) {

  const itr = getDescriber(this, 'it')

  packages = packages instanceof Array ? packages : [ packages ]

  let json

  for (let pkg of packages) {

    if (typeof pkg === 'string')
      pkg = { name: pkg, not: false, dev: false }

    const msg = `should ${pkg.not ? 'not ' : ''}have ${pkg.dev ? 'devD' : 'd'}ependency ${pkg.name}`

    itr(msg, () => {

      if (!json)
        json = fs.readJsonSync(path.join(projectDir, 'package.json'))

      const deps = pkg.dev ? json.devDependencies : json.dependencies
      expect(pkg.name in deps).to.be.equal(!pkg.not)
    })
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getDescriber.wrap(expectDependencies)
