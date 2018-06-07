// import { expect } from 'chai'
// import 'styled-components-test-utils/lib/chai'
// import renderer from 'react-test-renderer'
/******************************************************************************/
// Main
/******************************************************************************/

// rrci = reactRendererCreatedInstance
function expectStyleRules (rrci, styles) {
  // TODO fix? remove?
  throw new Error('styled-components-test-utils doesn\'t seem to work when imported from a different repository. No idea why.')
  // if (this !== undefined) {
  //   styles = rrci
  //   rrci = this
  // }
  //
  // for (const property in styles)
  //   expect(rrci).toHaveStyleRule(property, `${styles[property]}`)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default expectStyleRules
