import testOptionallyBindableMethod from './test-optionally-bindable-method'
import testPackageOutput from './test-package-output'
import testPropTypes from './test-prop-types'

import expectReject from './expect-reject'
import expectResolve from './expect-resolve'
import expectStyleRules from './expect-style-rules'

/******************************************************************************/
// Test Object
/******************************************************************************/

const Test = {
  optionallyBindableMethod: testOptionallyBindableMethod,
  packageOutput: testPackageOutput,
  propTypes: testPropTypes
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Test

export {
  testOptionallyBindableMethod,
  testPackageOutput,
  testPropTypes,

  expectReject,
  expectResolve,
  expectStyleRules
}
