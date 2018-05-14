import getDescriber from '../../src/test-util/get-describer'
import fs from 'fs'
import path from 'path'
import { expect } from 'chai'

/******************************************************************************/
// Main
/******************************************************************************/

function expectFile ({
  projectDir,
  url,
  contents,
  not = false }) {

  const itr = getDescriber(this, 'it')
  const fullDir = path.join(projectDir, url)

  contents = !contents || contents instanceof Array ? contents : [ contents ]

  const shouldExist = contents || !not
  const exists = fs.existsSync(fullDir)

  itr(`${url} should ${shouldExist ? 'exist' : 'not exist'}`, () => {

    // file needs to exists if contents are defined or test is negated
    expect(exists).to.be.equal(shouldExist)
  })

  if (contents && exists) {
    const str = fs.readFileSync(fullDir, 'utf-8')
    for (const content of contents)
      itr(`${not ? 'does not have' : 'has'} content: ${content}`, () => {
        expect(str.includes(content)).to.be.equal(!not)
      })
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getDescriber.wrap(expectFile)
