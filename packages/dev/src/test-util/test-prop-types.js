import getDescriber from './get-describer'
import { expect } from 'chai'
import is from 'is-explicit'

/* global before it describe */

/******************************************************************************/
// Main
/******************************************************************************/

function testPropTypes (Component, tests) {

  if (!testPropTypes.warned) {
    console.warn(
      'testPropTypes tests are currently ignored because the new' +
      'schema proptypes syntax currently does nothing')
    testPropTypes.warned = true
  }

  // getDescriber(this) <- replace describe.skip with this when <proptypes/> supported
  describe.skip(`testing propTypes for ${Component.name}`, () => {

    let propTypes
    before(() => {
      propTypes = Component && Component.propTypes
    })

    it(`proptypes is defined for component ${Component.name}`, () => {
      expect(is.objectOf.func(propTypes)).to.be.equal(true)
    })

    if (!is.func(tests))
      return

    const expectError = props => {

      if (!is.object(props))
        throw new Error('props must be an object')

      for (const propName in propTypes) {
        const result = propTypes[propName](props, propName, Component.name)
        if (result instanceof Error)
          return expect(result.message)
      }

      return expect(null)
    }

    tests(expectError)
  })

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getDescriber.wrap(testPropTypes)
